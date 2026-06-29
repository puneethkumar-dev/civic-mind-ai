import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';
import { runAIDecisionPipeline } from './services/aiService.js';
import { calculatePriorityScore, calculateImpactScore, calculateUpdatedConfidence, getPriorityLevel } from './services/priorityScore.js';
import { runInsightsAgent, getDeterministicInsights } from './services/agents/insightsAgent.js';

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
    const serviceAccountPath = new URL('./serviceAccount.json', import.meta.url);
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId
    });
  }
  db = admin.firestore();
  console.log(`[Firebase Admin] Connected to Firestore project: "${projectId}" (using service account key)`);
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second strict timeout

    const response = await fetch(imageUri, { signal: controller.signal });
    clearTimeout(timeoutId);

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

// Authentication Middleware
const checkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check if we have a mock user id in headers or body for developer testing fallback
    const mockUserId = req.headers['x-mock-user-id'] || req.body.userId || req.query.userId;
    if (mockUserId && mockUserId.startsWith('mock-')) {
      req.user = {
        uid: mockUserId,
        role: mockUserId.includes('admin') ? 'admin' : 'citizen',
        displayName: mockUserId.includes('admin') ? 'Admin Officer' : 'Citizen',
        email: mockUserId.includes('admin') ? 'admin@civicmind.gov' : 'citizen@civicmind.org'
      };
      return next();
    }
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // If the token starts with 'mock-', bypass verification for local testing
    if (token.startsWith('mock-')) {
      req.user = {
        uid: token,
        role: token.includes('admin') ? 'admin' : 'citizen',
        displayName: token.includes('admin') ? 'Admin Officer' : 'Citizen',
        email: token.includes('admin') ? 'admin@civicmind.gov' : 'citizen@civicmind.org'
      };
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Retrieve role from Firestore
    let role = 'citizen';
    try {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        role = userDoc.data().role || 'citizen';
      }
    } catch (dbErr) {
      console.warn('[Auth Middleware] Firestore role read error:', dbErr.message);
    }

    req.user = {
      uid: decodedToken.uid,
      role: role,
      email: decodedToken.email,
      displayName: decodedToken.name || 'Citizen'
    };
    next();
  } catch (error) {
    console.error('[Auth Middleware] Exception:', error);
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token.', error: error.message });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges.' });
    }
    next();
  };
};

// POST /api/issues - Create a report and run the sequential AI pipeline
app.post('/api/issues', checkAuth, async (req, res) => {
  const { issueId, clarificationCategory, description, imageReference, location } = req.body;
  const user = req.user;

  if (!db) {
    return res.status(500).json({ success: false, message: 'Firebase Database is not connected on the server.' });
  }

  try {
    let issueRef;
    let existingIssue = null;
    let isClarification = false;

    if (issueId) {
      issueRef = db.collection('issues').doc(issueId);
      const docSnap = await issueRef.get();
      if (docSnap.exists) {
        existingIssue = docSnap.data();
        isClarification = true;
      }
    }

    // 1. If it's a new report
    if (!isClarification) {
      if (!description && !imageReference) {
        return res.status(400).json({ success: false, message: 'Missing report description or image.' });
      }
      if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        return res.status(400).json({ success: false, message: 'Invalid or missing GPS coordinates.' });
      }

      // Generate tracking ID and document ID
      const trackingId = 'CM-' + Math.floor(10000 + Math.random() * 90000);
      issueRef = db.collection('issues').doc();
      const newIssueId = issueRef.id;

      // Query Firestore for other issues (for duplicate check)
      const nearbyIssues = [];
      try {
        const snap = await db.collection('issues').limit(50).get();
        snap.forEach((d) => {
          if (d.id !== newIssueId) {
            nearbyIssues.push(d.data());
          }
        });
      } catch (e) {
        console.warn('[AI Pipeline] Error fetching nearby issues for duplicate check:', e.message);
      }

      // Download / prepare the image buffer
      const { buffer, mimeType } = await getImageBuffer(imageReference);

      // Run sequential Gemini AI decision pipeline
      const result = await runAIDecisionPipeline(
        buffer,
        mimeType,
        description || '',
        imageReference ? 'report_photo.jpg' : '',
        location,
        nearbyIssues,
        clarificationCategory
      );

      // Handle low-confidence trigger
      if (result.lowConfidenceTrigger) {
        const initialTimeline = [
          {
            title: 'Reported',
            description: 'Issue reported by citizen.',
            actor: 'Citizen',
            timestamp: new Date().toISOString()
          },
          {
            title: 'Awaiting Clarification',
            description: `AI Vision Agent requested clarification: "${result.visualDescription}"`,
            actor: 'Vision Agent',
            timestamp: new Date().toISOString()
          }
        ];

        const initialIssueData = {
          issueId: newIssueId,
          trackingId,
          reportedBy: {
            uid: user.uid,
            displayName: user.displayName || 'Citizen',
            email: user.email || ''
          },
          citizenId: user.uid,
          imageReference: imageReference || '',
          description: description || '',
          location: location || null,
          status: 'Awaiting Clarification',
          timeline: initialTimeline,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lowConfidence: true,
          visualDescription: result.visualDescription
        };

        await issueRef.set(initialIssueData);

        return res.status(200).json({
          success: true,
          message: 'Awaiting citizen clarification due to low AI confidence.',
          data: {
            lowConfidence: true,
            issueId: newIssueId,
            trackingId,
            visualDescription: result.visualDescription
          }
        });
      }

      // Formulate complete AI analysis
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

      const timeline = [
        {
          title: 'Reported',
          description: 'Issue reported by citizen.',
          actor: 'Citizen',
          timestamp: new Date().toISOString()
        },
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
        timeline.push({
          title: 'Potential Duplicate Identified',
          description: `Matches existing issue reference: ${result.existingIssueId || 'Unknown'}`,
          actor: 'Duplicate Agent',
          timestamp: new Date().toISOString()
        });
      }

      const initialScore = calculatePriorityScore(result.severity, 0, 0, new Date());

      const finalIssueData = {
        issueId: newIssueId,
        trackingId,
        reportedBy: {
          uid: user.uid,
          displayName: user.displayName || 'Citizen',
          email: user.email || ''
        },
        citizenId: user.uid,
        imageReference: imageReference || '',
        description: description || '',
        location: location || null,
        status: 'AI Verified',
        category: result.category,
        priority: result.severity,
        department: result.department,
        aiAnalysis,
        confidenceScore: result.confidence,
        timeline,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        verificationCount: 0,
        verifiedUsers: [],
        supportCount: 0,
        supportedUsers: [],
        priorityScore: initialScore,
        communityVerified: false,
        lastUpdated: new Date().toISOString()
      };

      // Award 15 points for submitting a new validated report
      await awardUserPoints(user.uid, 15);

      await issueRef.set(finalIssueData);

      return res.status(201).json({
        success: true,
        message: 'Issue reported and AI pipeline completed.',
        data: {
          lowConfidence: false,
          issueId: newIssueId,
          trackingId,
          aiAnalysis,
          timeline,
          status: 'AI Verified'
        }
      });
    } else {
      // 2. If it's a clarification on an existing report
      if (!clarificationCategory) {
        return res.status(400).json({ success: false, message: 'Missing clarification category.' });
      }

      // Query nearby issues
      const nearbyIssues = [];
      try {
        const snap = await db.collection('issues').limit(50).get();
        snap.forEach((d) => {
          if (d.id !== issueId) {
            nearbyIssues.push(d.data());
          }
        });
      } catch (e) {
        console.warn('[AI Pipeline] Error fetching nearby issues:', e.message);
      }

      const { buffer, mimeType } = await getImageBuffer(existingIssue.imageReference);

      // Run pipeline with clarification override
      const result = await runAIDecisionPipeline(
        buffer,
        mimeType,
        existingIssue.description || '',
        existingIssue.imageReference ? 'report_photo.jpg' : '',
        existingIssue.location,
        nearbyIssues,
        clarificationCategory
      );

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

      const timelineUpdates = [
        {
          title: 'Citizen Clarification Received',
          description: `Citizen clarified category: "${result.category}"`,
          actor: 'Citizen',
          timestamp: new Date().toISOString()
        },
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
        timelineUpdates.push({
          title: 'Potential Duplicate Identified',
          description: `Matches existing issue reference: ${result.existingIssueId || 'Unknown'}`,
          actor: 'Duplicate Agent',
          timestamp: new Date().toISOString()
        });
      }

      const currentTimeline = existingIssue.timeline || [];
      const updatedTimeline = [...currentTimeline, ...timelineUpdates];
      const initialScore = calculatePriorityScore(result.severity, 0, 0, existingIssue.createdAt || new Date());

      const updateData = {
        status: 'AI Verified',
        category: result.category,
        priority: result.severity,
        department: result.department,
        aiAnalysis,
        confidenceScore: result.confidence,
        timeline: updatedTimeline,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        priorityScore: initialScore,
        lastUpdated: new Date().toISOString()
      };

      // Award 15 points to user for submitting report clarification
      await awardUserPoints(user.uid, 15);

      await issueRef.update(updateData);

      return res.status(200).json({
        success: true,
        message: 'Clarification received and pipeline complete.',
        data: {
          lowConfidence: false,
          issueId,
          trackingId: existingIssue.trackingId,
          aiAnalysis,
          timeline: updatedTimeline,
          status: 'AI Verified'
        }
      });
    }

  } catch (error) {
    console.error('[POST /api/issues] Exception:', error);
    res.status(500).json({ success: false, message: 'Server failed to process report submission.', error: error.message });
  }
});

// GET /api/issues - Fetch reports (supports reportedBy.uid query filter)
app.get('/api/issues', checkAuth, async (req, res) => {
  if (!db) {
    return res.status(500).json({ success: false, message: 'Firebase Database is not connected on the server.' });
  }

  try {
    const { uid } = req.query;
    let queryRef = db.collection('issues');
    
    if (uid) {
      queryRef = queryRef.where('reportedBy.uid', '==', uid);
    }

    const snapshot = await queryRef.get();
    const issues = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      issues.push({
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
      });
    });

    // Sort descending by creation date
    issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('[GET /api/issues] Exception:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve issues.', error: error.message });
  }
});

// GET /api/issues/:id - Fetch single report details
app.get('/api/issues/:id', checkAuth, async (req, res) => {
  if (!db) {
    return res.status(500).json({ success: false, message: 'Firebase Database is not connected on the server.' });
  }

  try {
    const { id } = req.params;
    let docRef = db.collection('issues').doc(id);
    let docSnap = await docRef.get();

    if (!docSnap.exists) {
      // Fallback search by tracking ID
      const trackingSnap = await db.collection('issues').where('trackingId', '==', id).limit(1).get();
      if (trackingSnap.empty) {
        return res.status(404).json({ success: false, message: `Issue with ID ${id} not found.` });
      }
      docSnap = trackingSnap.docs[0];
    }

    const data = docSnap.data();
    const issue = {
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
    };

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('[GET /api/issues/:id] Exception:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve issue details.', error: error.message });
  }
});

// GET /api/dashboard - Aggregated stats for dashboards
app.get('/api/dashboard', checkAuth, async (req, res) => {
  if (!db) {
    return res.status(500).json({ success: false, message: 'Firebase Database is not connected on the server.' });
  }

  try {
    const { userId } = req.query;

    const snapshot = await db.collection('issues').get();
    const issues = [];
    snapshot.forEach((doc) => {
      issues.push(doc.data());
    });

    const total = issues.length;
    const awaitingAction = issues.filter(i => i.status === 'Reported' || i.status === 'AI Verified' || i.status === 'Awaiting Clarification').length;
    const inProgress = issues.filter(i => i.status === 'In Progress' || i.status === 'Assigned').length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;

    // Severity breakdown
    const critical = issues.filter(i => (i.aiAnalysis?.severity || i.priority) === 'Critical').length;
    const high = issues.filter(i => (i.aiAnalysis?.severity || i.priority) === 'High').length;
    const medium = issues.filter(i => (i.aiAnalysis?.severity || i.priority) === 'Medium').length;
    const low = issues.filter(i => (i.aiAnalysis?.severity || i.priority) === 'Low').length;

    // Department breakdown
    const departmentBreakdown = {};
    issues.forEach((i) => {
      const dept = i.aiAnalysis?.department || i.department || 'Municipality';
      departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1;
    });

    let citizenStats = null;
    if (userId) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        citizenStats = {
          points: userData.points || 0,
          badges: userData.badges || [],
          reportsCount: issues.filter(i => i.reportedBy?.uid === userId).length
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          awaitingAction,
          inProgress,
          resolved,
          severity: { critical, high, medium, low }
        },
        departments: departmentBreakdown,
        citizenStats
      }
    });
  } catch (error) {
    console.error('[GET /api/dashboard] Exception:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats.', error: error.message });
  }
});


// GET /api/admin/insights - Fetch and cache dynamic AI Insights for administrators
let cachedInsights = null;
let cachedFingerprint = '';

// Helper to construct the unified insights response shape
const constructInsightsResponse = (agentResult, issues) => {
  const totalIssues = issues.length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
  const pendingCount = totalIssues - resolvedCount;
  const resolutionRate = totalIssues > 0 ? `${Math.round((resolvedCount / totalIssues) * 100)}%` : "0%";

  const verifiedCount = issues.filter(i => (i.verificationCount || 0) > 0).length;
  const verificationRate = totalIssues > 0 ? `${Math.round((verifiedCount / totalIssues) * 100)}%` : "0%";

  let communityConfidence = "100%";
  if (totalIssues > 0) {
    const totalConf = issues.reduce((acc, i) => acc + (i.aiAnalysis?.confidence || i.confidence || 70), 0);
    communityConfidence = `${Math.round(totalConf / totalIssues)}%`;
  }

  return {
    executiveSummary: agentResult.summary || agentResult.executiveSummary || "No active insights available.",
    topCategory: agentResult.topCategory || "None",
    hotspot: agentResult.hotspot || "N/A",
    criticalIssues: typeof agentResult.highPriorityCount === 'number' 
      ? agentResult.highPriorityCount 
      : (typeof agentResult.criticalIssues === 'number' ? agentResult.criticalIssues : 0),
    resolutionRate,
    mostBusyDepartment: agentResult.mostBusyDepartment || "None",
    communityConfidence,
    verificationRate,
    resolvedCount,
    pendingCount,
    trend: agentResult.trend || "No growth trends detected.",
    recommendation: agentResult.recommendation || "Regular monitoring suggested."
  };
};

app.get('/api/admin/insights', checkAuth, async (req, res) => {
  if (!db) {
    return res.status(500).json({ success: false, message: 'Firebase Database is not connected on the server.' });
  }

  try {
    const snapshot = await db.collection('issues').get();
    const issues = [];
    snapshot.forEach((doc) => {
      issues.push(doc.data());
    });

    // Create a fingerprint of the current issues state to cache AI response
    const fingerprint = issues
      .map(i => `${i.issueId}-${i.status}-${i.lastUpdated || i.updatedAt}`)
      .sort()
      .join('|');

    if (cachedInsights && fingerprint === cachedFingerprint) {
      return res.status(200).json({
        success: true,
        message: 'AI Insights retrieved from cache.',
        data: cachedInsights
      });
    }

    console.log('[API Insights] Running Insights Agent...');
    const agentResult = await runInsightsAgent(issues);
    const responseData = constructInsightsResponse(agentResult, issues);

    cachedInsights = responseData;
    cachedFingerprint = fingerprint;

    res.status(200).json({
      success: true,
      message: 'AI Insights generated successfully.',
      data: responseData
    });
  } catch (error) {
    console.error('[GET /api/admin/insights] Exception:', error);
    try {
      const snapshot = await db.collection('issues').get();
      const issues = [];
      snapshot.forEach(doc => issues.push(doc.data()));
      const fallbackResult = getDeterministicInsights(issues);
      const responseData = constructInsightsResponse(fallbackResult, issues);

      res.status(200).json({
        success: true,
        message: 'Calculated fallback insights retrieved successfully.',
        data: responseData,
        fallback: true
      });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Failed to retrieve insights.', error: error.message });
    }
  }
});


const awardUserPoints = async (uid, amount) => {
  if (!db || !uid) return;
  try {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      const currentPoints = userSnap.data().points || 0;
      await userRef.update({
        points: currentPoints + amount
      });
      console.log(`[Points] Awarded ${amount} points to user ${uid}. Total: ${currentPoints + amount}`);
    } else {
      await userRef.set({
        uid,
        points: amount,
        badges: ['Helper'],
        createdAt: new Date().toISOString()
      }, { merge: true });
      console.log(`[Points] Created user doc and awarded ${amount} points to user ${uid}.`);
    }
  } catch (err) {
    console.error(`[Points] Failed to award points to user ${uid}:`, err.message);
  }
};


// POST /api/issues/:id/verify - Cast upvote or downvote for community verification
app.post('/api/issues/:id/verify', checkAuth, async (req, res) => {
  const { id } = req.params;
  const { vote } = req.body;
  const user = req.user;

  if (!vote || (vote !== 'up' && vote !== 'down')) {
    return res.status(400).json({ success: false, message: 'Invalid or missing vote parameter. Must be "up" or "down".' });
  }

  if (!db) {
    return res.status(500).json({ success: false, message: 'Firebase Database is not connected on the server.' });
  }

  try {
    const issueRef = db.collection('issues').doc(id);
    const docSnap = await issueRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ success: false, message: `Issue with ID ${id} not found.` });
    }

    const issue = docSnap.data();
    
    // Safely initialize verification fields if they don't exist
    const verification = issue.verification || {
      upvotes: 0,
      downvotes: 0,
      confidence: 0,
      voters: {}
    };

    // Initialize/normalize nested fields just in case they are missing in the existing object
    if (verification.upvotes === undefined) verification.upvotes = 0;
    if (verification.downvotes === undefined) verification.downvotes = 0;
    if (verification.confidence === undefined) verification.confidence = 0;
    if (!verification.voters) verification.voters = {};

    const userId = user.uid;

    // Prevent duplicate voting by the same user
    if (verification.voters[userId]) {
      return res.status(400).json({ success: false, message: 'You have already voted on this issue.' });
    }

    // Increment vote counts and record voter choice
    if (vote === 'up') {
      verification.upvotes += 1;
      verification.voters[userId] = 'up';
    } else {
      verification.downvotes += 1;
      verification.voters[userId] = 'down';
    }

    // Recalculate confidence percentage: (upvotes / (upvotes + downvotes)) * 100
    const totalVotes = verification.upvotes + verification.downvotes;
    verification.confidence = totalVotes === 0 ? 0 : Math.round((verification.upvotes / totalVotes) * 100);

    // Award 5 points for verification vote participation
    await awardUserPoints(userId, 5);

    // Save back to Firestore
    await issueRef.update({
      verification: verification,
      lastUpdated: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Vote registered successfully.',
      data: verification
    });
  } catch (error) {
    console.error('[POST /api/issues/:id/verify] Exception:', error);
    res.status(500).json({ success: false, message: 'Failed to record verification vote.', error: error.message });
  }
});


// Unified Action Endpoint for Collaborative Community Verification
app.post('/api/issues/:issueId/action', checkAuth, async (req, res) => {
  const { issueId } = req.params;
  const { action, userId, evidenceUrl } = req.body;

  if (!action || !userId) {
    return res.status(400).json({ success: false, message: 'Missing action or userId parameter.' });
  }

  if (!db) {
    return res.status(500).json({ success: false, message: 'Firebase Database is not connected on the server.' });
  }

  try {
    const issueRef = db.collection('issues').doc(issueId);
    const docSnap = await issueRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ success: false, message: `Issue with ID ${issueId} not found.` });
    }

    const issue = docSnap.data();

    // 1. Validations: Prevent users from acting on their own reports (except for evidence upload)
    const reporterUid = issue.reportedBy?.uid || '';
    if (reporterUid === userId && action !== 'evidence') {
      return res.status(400).json({ success: false, message: 'You cannot perform this verification action on your own report.' });
    }

    // 2. Initialize Module 5 fields if missing
    let verifiedUsers = issue.verifiedUsers || [];
    let verificationCount = issue.verificationCount || 0;
    let experiencedUsers = issue.experiencedUsers || [];
    let experiencedCount = issue.experiencedCount || 0;
    let evidenceImages = issue.evidenceImages || [];
    let noLongerExistsUsers = issue.noLongerExistsUsers || [];
    let noLongerExistsCount = issue.noLongerExistsCount || 0;
    let verificationHistory = issue.verificationHistory || [];
    let confidenceHistory = issue.confidenceHistory || [];
    let timeline = [...(issue.timeline || [])];
    let status = issue.status || 'Reported';

    // 3. Prevent duplicate actions by the same citizen
    if (action === 'verify' && verifiedUsers.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have already verified this report.' });
    }
    if (action === 'experience' && experiencedUsers.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have already flagged that you experienced this issue.' });
    }
    if (action === 'no_longer_exists' && noLongerExistsUsers.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have already flagged this issue as no longer visible.' });
    }

    // 4. Record action in history
    verificationHistory.push({
      uid: userId,
      action,
      timestamp: new Date().toISOString()
    });

    let timelineEvent = null;

    if (action === 'verify') {
      verifiedUsers.push(userId);
      verificationCount = verifiedUsers.length;
      timelineEvent = {
        title: 'Community Verification Received',
        description: `Verified by citizen. Total verifications: ${verificationCount}.`,
        actor: 'Community',
        timestamp: new Date().toISOString()
      };
    } else if (action === 'experience') {
      experiencedUsers.push(userId);
      experiencedCount = experiencedUsers.length;
      timelineEvent = {
        title: 'Personal Impact Flagged',
        description: 'A citizen flagged that they were personally affected by this issue.',
        actor: 'Community',
        timestamp: new Date().toISOString()
      };
    } else if (action === 'evidence') {
      if (!evidenceUrl) {
        return res.status(400).json({ success: false, message: 'Missing evidenceUrl for evidence action.' });
      }
      evidenceImages.push({
        url: evidenceUrl,
        uploadedBy: userId,
        timestamp: new Date().toISOString()
      });
      timelineEvent = {
        title: 'Additional Evidence Uploaded',
        description: 'A citizen uploaded supporting photos validating this issue.',
        actor: 'Community',
        timestamp: new Date().toISOString()
      };
    } else if (action === 'no_longer_exists') {
      noLongerExistsUsers.push(userId);
      noLongerExistsCount = noLongerExistsUsers.length;
      timelineEvent = {
        title: 'Flagged as Resolved',
        description: 'A citizen flagged that this issue is no longer visible.',
        actor: 'Community',
        timestamp: new Date().toISOString()
      };

      // If 3 or more citizens flag resolved, set status to Resolved automatically
      if (noLongerExistsCount >= 3 && status !== 'Resolved') {
        status = 'Resolved';
        timeline.push({
          title: 'Resolved by Community Consensus',
          description: 'Marked resolved due to collaborative community flags.',
          actor: 'Community',
          timestamp: new Date().toISOString()
        });
      }
    }

    if (timelineEvent) {
      timeline.push(timelineEvent);
    }

    // 5. Compute AI Confidence growth
    const initialConfidence = issue.aiAnalysis?.confidence || 70;
    const currentConfidence = calculateUpdatedConfidence(initialConfidence, verificationCount);
    
    confidenceHistory.push({
      value: currentConfidence,
      timestamp: new Date().toISOString()
    });

    // 6. Compute scores
    const currentSeverity = issue.aiAnalysis?.severity || 'Medium';
    const newImpactScore = calculateImpactScore(currentSeverity, verificationCount, experiencedCount, evidenceImages.length, issue.createdAt);
    const newPriorityScore = calculatePriorityScore(currentSeverity, verificationCount, experiencedCount, issue.createdAt);

    // 7. Dynamic priority escalation
    const nextPriority = getPriorityLevel(newPriorityScore);
    const previousPriority = issue.aiAnalysis?.severity || 'Medium';
    
    let updatedAiAnalysis = {
      ...(issue.aiAnalysis || {}),
      confidence: currentConfidence,
      severity: nextPriority
    };

    if (nextPriority !== previousPriority) {
      timeline.push({
        title: 'Priority Score Upgraded',
        description: `Validation updated priority level from "${previousPriority}" to "${nextPriority}".`,
        actor: 'CivicMind AI',
        timestamp: new Date().toISOString()
      });
    }

    // 8. Update DB payload
    const updateData = {
      verifiedUsers,
      verificationCount,
      experiencedUsers,
      experiencedCount,
      evidenceImages,
      noLongerExistsUsers,
      noLongerExistsCount,
      verificationHistory,
      confidenceHistory,
      impactScore: newImpactScore,
      priorityScore: newPriorityScore,
      aiAnalysis: updatedAiAnalysis,
      status,
      timeline,
      lastUpdated: new Date().toISOString()
    };

    await issueRef.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Civic action successfully recorded.',
      data: {
        issueId,
        ...updateData
      }
    });

  } catch (error) {
    console.error('[Action API] Exception:', error);
    res.status(500).json({ success: false, message: 'Server failed to record action.', error: error.message });
  }
});
// Backward compatibility legacy redirects
app.post('/api/issues/:issueId/verify', checkAuth, (req, res) => {
  req.body.action = 'verify';
  res.redirect(307, `/api/issues/${req.params.issueId}/action`);
});

app.post('/api/issues/:issueId/support', checkAuth, (req, res) => {
  req.body.action = 'experience';
  res.redirect(307, `/api/issues/${req.params.issueId}/action`);
});

// Start Server listener
app.listen(PORT, () => {
  console.log(`[Express Server] Running on http://localhost:${PORT}`);
});
