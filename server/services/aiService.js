import { isGeminiEnabled } from './geminiClient.js';
import { runMockAIDecisionPipeline } from './mockAiService.js';
import { runVisionAgent } from './agents/visionAgent.js';
import { runCategorizationAgent } from './agents/categorizationAgent.js';
import { runPriorityAgent } from './agents/priorityAgent.js';
import { runRoutingAgent } from './agents/routingAgent.js';
import { runDuplicateAgent } from './agents/duplicateAgent.js';
import { runSummaryAgent } from './agents/summaryAgent.js';

/**
 * Executes the sequential AI Decision Pipeline for a newly submitted civic issue report.
 * 
 * @param {Buffer} imageBuffer Binary file buffer of the uploaded image
 * @param {string} mimeType Mime type of the image
 * @param {string} description Citizen voice-to-text or typed notes
 * @param {string} filename Original image name
 * @param {object} location Issue GPS coords and address: { latitude, longitude, address }
 * @param {Array} nearbyIssues List of active nearby issues loaded from database
 * @param {string|null} clarificationCategory Selected category if low-confidence override was sent
 * @returns {Promise<object>} Result matching pipeline specifications
 */
export const runAIDecisionPipeline = async (
  imageBuffer,
  mimeType,
  description,
  filename,
  location,
  nearbyIssues = [],
  clarificationCategory = null
) => {
  // If Gemini API is not configured, fall back to our local rule-based mock engine
  if (!isGeminiEnabled()) {
    console.log('[AI Service] Gemini API key not found in env. Falling back to rule-based Mock AI engine.');
    return await runMockAIDecisionPipeline(
      imageBuffer,
      mimeType,
      description,
      filename,
      location,
      nearbyIssues,
      clarificationCategory
    );
  }

  try {
    console.log('[AI Service] Starting Sequential Gemini AI Decision Pipeline...');

    // Stage 1: Vision Agent
    // Analyzes image details and initial query context
    console.log('[AI Service] Running Stage 1: Vision Agent...');
    const visionResult = await runVisionAgent(imageBuffer, mimeType, description);
    const visualDescription = visionResult.visualDescription || 'Visual analysis of reported civic issue';
    const initialConfidence = Number(visionResult.confidence) || 50;
    const predictedCategory = visionResult.predictedCategory || 'Other';

    console.log(`[AI Service] Vision Agent confidence: ${initialConfidence}%, predicted: "${predictedCategory}"`);

    // Low confidence handling: If confidence is below 70% and user hasn't clarified, halt pipeline
    if (initialConfidence < 70 && !clarificationCategory) {
      console.log('[AI Service] Low confidence detected (< 70%). Suspending pipeline for citizen clarification.');
      return {
        lowConfidenceTrigger: true,
        visualDescription
      };
    }

    // Stage 2: Categorization Agent
    // Standardizes the category or handles override category
    console.log('[AI Service] Running Stage 2: Categorization Agent...');
    const categorizationResult = await runCategorizationAgent(
      visualDescription,
      description,
      predictedCategory,
      clarificationCategory
    );
    const category = categorizationResult.category || 'Other';
    const confidence = Number(categorizationResult.confidence) || initialConfidence;

    console.log(`[AI Service] Categorization Agent resolved category to: "${category}" (confidence: ${confidence}%)`);

    // Stage 3: Priority Agent
    // Assigns severity rating: Low, Medium, High, Critical
    console.log('[AI Service] Running Stage 3: Priority Agent...');
    const priorityResult = await runPriorityAgent(category, visualDescription, description);
    const severity = priorityResult.severity || 'Medium';
    const urgencyReason = priorityResult.urgencyReason || 'Standard maintenance review required.';

    console.log(`[AI Service] Priority Agent resolved severity to: "${severity}"`);

    // Stage 4: Routing Agent
    // Maps issue category/severity to correct municipal department
    console.log('[AI Service] Running Stage 4: Routing Agent...');
    const routingResult = await runRoutingAgent(category, severity, visualDescription, description);
    const department = routingResult.department || 'Municipality';
    const routingReason = routingResult.routingReason || 'Routed to general municipality services.';

    console.log(`[AI Service] Routing Agent assigned department to: "${department}"`);

    // Stage 5: Duplicate Detection Agent
    // Compares reported issue against nearby reports
    console.log('[AI Service] Running Stage 5: Duplicate Detection Agent...');
    const combinedDesc = `${description} ${visualDescription}`;
    const duplicateResult = await runDuplicateAgent(category, location, combinedDesc, nearbyIssues);
    const duplicate = !!duplicateResult.duplicate;
    const existingIssueId = duplicateResult.existingIssueId || null;

    console.log(`[AI Service] Duplicate Agent duplicate status: ${duplicate} (matched issue: ${existingIssueId})`);

    // Stage 6: Summary Agent
    // Compiles a concise official log summary for dashboard and history logs
    console.log('[AI Service] Running Stage 6: Summary Agent...');
    const summaryResult = await runSummaryAgent(category, severity, department, visualDescription, description);
    const summary = summaryResult.summary || `Factual report of ${category.toLowerCase()} routed to ${department}.`;

    console.log('[AI Service] Summary Agent generated official log.');

    return {
      lowConfidenceTrigger: false,
      visualDescription,
      category,
      severity,
      department,
      confidence,
      summary,
      duplicate,
      existingIssueId,
      routingReason,
      urgencyReason
    };

  } catch (error) {
    console.error('[AI Service] Error in Gemini pipeline execution:', error);
    console.log('[AI Service] Gracefully falling back to mock pipeline due to error.');
    
    // Graceful fallback to mock service in case of network timeouts/errors
    return await runMockAIDecisionPipeline(
      imageBuffer,
      mimeType,
      description,
      filename,
      location,
      nearbyIssues,
      clarificationCategory
    );
  }
};
