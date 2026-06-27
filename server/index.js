import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { runAIDecisionPipeline } from './services/aiService.js';

dotenv.config();

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: '*' })); // Allow React clients to query
app.use(express.json());

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' }
});
app.use('/api/', limiter);

// Initialize Firebase Admin SDK
let db;
try {
  // If FIREBASE_PROJECT_ID is provided, initialize. Otherwise fallback to civic-mind-ai
  const projectId = process.env.FIREBASE_PROJECT_ID || 'civic-mind-ai';
  
  if (admin.apps.length === 0) {
    admin.initializeApp({
      projectId: projectId
    });
  }
  db = admin.firestore();
  console.log(`[Firebase Admin] Connected to Firestore project: "${projectId}"`);
} catch (error) {
  console.error('[Firebase Admin] Initialization failed:', error);
}

// Helper to fetch images safely (including blob preview fallbacks)
const getImageBuffer = async (imageUri) => {
  if (!imageUri) return { buffer: Buffer.alloc(0), mimeType: 'image/jpeg' };
  
  // If it's a browser blob URL (e.g. blob:http://localhost:5173/...), Node cannot download it.
  // Return a dummy placeholder image buffer to prevent crash in local mock mode.
  if (imageUri.startsWith('blob:') || imageUri.includes('mock-bucket')) {
    // Return empty buffer or dummy representation
    return { buffer: Buffer.alloc(0), mimeType: 'image/jpeg' };
  }

  try {
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType
    };
  } catch (error) {
    console.error(`[AI Pipeline] Failed to download image from ${imageUri}:`, error.message);
    return { buffer: Buffer.alloc(0), mimeType: 'image/jpeg' };
  }
};

// Expose AI Decision Pipeline analyzer route
app.post('/api/analyze', async (req, res) => {
  const { issueId, clarificationCategory } = req.body;

  if (!issueId) {
    return res.status(400).json({ success: false, message: 'Missing issueId parameter.' });
  }

  if (!db) {
    return res.status(500).json({ success: false, message: 'Firebase Database is not connected on the server.' });
  }

  try {
    let issueExists = false;
    let docSnap = null;
    const issueRef = db.collection('issues').doc(issueId);

    try {
      docSnap = await issueRef.get();
      issueExists = docSnap.exists;
    } catch (dbErr) {
      console.warn('[AI Pipeline] Firestore read error, using backup details:', dbErr.message);
    }

  let issue;
  if (issueExists && docSnap) {
    issue = docSnap.data();
  } else {
    // Local mock fallback for local testing without Firebase credentials
    console.log(`[AI Pipeline] Issue "${issueId}" not found in Firestore. Using backup request parameters.`);
    issue = {
      issueId,
      description: req.body.description || '',
      location: req.body.location || null,
      imageReference: req.body.imageReference || '',
      timeline: [
        {
          title: 'Reported',
          description: 'Issue reported by citizen.',
          actor: 'Citizen',
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

    // Query Firestore for other issues (for duplicate checks)
    let nearbyIssues = [];
    try {
      const snap = await db.collection('issues').limit(20).get();
      snap.forEach((d) => {
        if (d.id !== issueId) {
          nearbyIssues.push(d.data());
        }
      });
    } catch (e) {
      console.warn('[AI Pipeline] Error fetching nearby issues for duplicate check:', e.message);
    }

    // Download / prepare the image buffer
    const { buffer, mimeType } = await getImageBuffer(issue.imageReference);

    // Run Gemini decision pipeline stages sequentially
    const result = await runAIDecisionPipeline(
      buffer,
      mimeType,
      issue.description || '',
      issue.imageReference ? 'report_photo.jpg' : '',
      issue.location,
      nearbyIssues,
      clarificationCategory
    );

    // If Vision Agent confidence is below 70% and no clarification override has been received yet:
    // Interrupt pipeline and signal client to prompt user.
    if (result.lowConfidenceTrigger) {
      return res.status(200).json({
        success: true,
        message: 'Awaiting citizen clarification due to low AI confidence.',
        data: {
          lowConfidence: true,
          visualDescription: result.visualDescription
        }
      });
    }

    // Format analysis logs to merge into document
    const aiAnalysis = {
      category: result.category,
      severity: result.severity,
      department: result.department,
      confidence: result.confidence,
      summary: result.summary,
      duplicateStatus: result.duplicate ? 'Duplicate' : 'No Duplicate',
      routingReason: result.routingReason,
      urgencyReason: result.urgencyReason,
      processedAt: new Date().toISOString()
    };

    // Construct new timeline logs
    const newTimelineEntries = [
      {
        title: 'AI Analysis Complete',
        description: result.summary,
        actor: 'Vision Agent',
        timestamp: new Date().toISOString()
      },
      {
        title: 'Priority Determined',
        description: `Priority set to ${result.severity}. Reason: ${result.urgencyReason}`,
        actor: 'Priority Agent',
        timestamp: new Date().toISOString()
      },
      {
        title: 'Department Assigned',
        description: `Routed to ${result.department} department. Reason: ${result.routingReason}`,
        actor: 'Routing Agent',
        timestamp: new Date().toISOString()
      }
    ];

    if (result.duplicate) {
      newTimelineEntries.push({
        title: 'Potential Duplicate Identified',
        description: `Matches existing issue reference: ${result.existingIssueId || 'Unknown'}`,
        actor: 'Duplicate Agent',
        timestamp: new Date().toISOString()
      });
    }

    const currentTimeline = issue.timeline || [];
    const updatedTimeline = [...currentTimeline, ...newTimelineEntries];

    // Lifecycle status update: Reported -> AI Verified (only if exists in Firestore)
    if (issueExists) {
      await issueRef.update({
        aiAnalysis,
        timeline: updatedTimeline,
        status: 'AI Verified',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      console.log(`[AI Pipeline] Local testing: Skipped Firestore write for local issue "${issueId}".`);
    }

    res.status(200).json({
      success: true,
      message: 'AI decision pipeline completed and Firestore updated.',
      data: {
        lowConfidence: false,
        aiAnalysis,
        timeline: updatedTimeline
      }
    });

  } catch (error) {
    console.error('[AI Pipeline] Server exception:', error);
    res.status(500).json({ success: false, message: 'Server failed to process the AI analysis pipeline.', error: error.message });
  }
});

// Start Server listener
app.listen(PORT, () => {
  console.log(`[Express Server] Running on http://localhost:${PORT}`);
});
