import { callGemini } from '../geminiClient.js';

/**
 * Stage 5: Duplicate Detection Agent
 * Evaluates whether a newly reported issue is a duplicate of a nearby active report.
 * 
 * @param {string} category The standardized category
 * @param {object} location Coordinate and address object: { latitude, longitude, address }
 * @param {string} description Combined descriptions (visual + citizen)
 * @param {Array} nearbyIssues List of nearby issues loaded from database
 * @returns {Promise<{ duplicate: boolean, existingIssueId: string|null }>}
 */
export const runDuplicateAgent = async (category, location, description, nearbyIssues) => {
  if (!Array.isArray(nearbyIssues) || nearbyIssues.length === 0) {
    return { duplicate: false, existingIssueId: null };
  }

  // Pre-filter candidates in JavaScript to conserve tokens and improve accuracy
  // We match issues that:
  // 1. Have the same category (case-insensitive)
  // 2. Are in general proximity (within ~0.005 latitude/longitude degrees, roughly 500m)
  const candidates = nearbyIssues.filter(issue => {
    const otherCat = issue.aiAnalysis?.category || issue.category || '';
    const isSameCat = otherCat.toLowerCase() === category.toLowerCase();
    
    if (!isSameCat) return false;

    if (location && location.latitude && location.longitude && issue.location && issue.location.latitude && issue.location.longitude) {
      const latDiff = Math.abs(issue.location.latitude - location.latitude);
      const lngDiff = Math.abs(issue.location.longitude - location.longitude);
      // Roughly 500 meters search box
      return latDiff <= 0.005 && lngDiff <= 0.005;
    }

    // Fallback: simple address matching if coordinates are missing
    if (location && location.address && issue.location && issue.location.address) {
      const addr1 = location.address.toLowerCase();
      const addr2 = issue.location.address.toLowerCase();
      const words1 = addr1.split(/\s+/).filter(w => w.length > 3);
      const words2 = addr2.split(/\s+/).filter(w => w.length > 3);
      const common = words1.filter(w => words2.includes(w));
      return common.length >= 2;
    }

    return false;
  });

  if (candidates.length === 0) {
    return { duplicate: false, existingIssueId: null };
  }

  // Format the filtered candidates list for Gemini comparison
  const candidatesListText = candidates.map((c, index) => {
    return `Candidate ${index + 1}:
- Issue ID/Tracking: "${c.issueId || c.trackingId}"
- Description: "${c.description || ''}"
- Summary: "${c.aiAnalysis?.summary || ''}"
- Location: "${c.location?.address || 'Unknown'}"`;
  }).join('\n\n');

  const prompt = `You are a Duplicate Detection Agent. Determine if the new civic report is a duplicate of any existing reports listed below.
A report is a duplicate if it describes the exact same physical problem (e.g., the same pothole, same leaking water pipe, same garbage pile) at the same location.

New Report details:
- Category: "${category}"
- Location: "${location?.address || 'local coordinates'}"
- Description: "${description}"

Existing Nearby Reports:
${candidatesListText}

Decide:
1. Does the new report describe the same physical issue as one of the candidates?
2. If yes, set duplicate = true and identify which Issue ID it matches. Otherwise, set duplicate = false and existingIssueId = null.

Format your response exactly as this JSON structure:
{
  "duplicate": true,
  "existingIssueId": "Issue ID of the matching candidate, or null if no duplicate"
}`;

  const systemInstruction = "You are a Duplicate Detection Agent. You must output only a valid JSON object matching the requested schema.";

  try {
    const result = await callGemini(prompt, systemInstruction);
    
    // Ensure safety: check if result is valid and matches one of the candidates
    const isDuplicate = !!result.duplicate;
    let matchingId = result.duplicate ? result.existingIssueId : null;
    
    if (isDuplicate && matchingId) {
      // Find matching issue to confirm its ID
      const verifiedCandidate = candidates.find(c => (c.issueId === matchingId || c.trackingId === matchingId));
      if (verifiedCandidate) {
        matchingId = verifiedCandidate.issueId; // Normalize to use database document ID
      } else {
        // Fallback to first candidate if the AI returned a formatted string rather than exact ID
        matchingId = candidates[0].issueId;
      }
    }

    return {
      duplicate: isDuplicate,
      existingIssueId: matchingId
    };
  } catch (err) {
    console.warn('[Duplicate Agent] Gemini execution failed, fallback to duplicate = false:', err.message);
    return { duplicate: false, existingIssueId: null };
  }
};
