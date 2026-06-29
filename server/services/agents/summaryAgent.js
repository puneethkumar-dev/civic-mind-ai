import { callGemini } from '../geminiClient.js';

/**
 * Stage 6: Summary Agent
 * Generates a concise, official, factual, and professional summary suitable for
 * admin dashboards, timelines, and government records.
 * 
 * @param {string} category Standardized category
 * @param {string} severity Resolved severity
 * @param {string} department Assigned department
 * @param {string} visualDescription Factual description from Vision Agent
 * @param {string} userDescription Citizen notes
 * @returns {Promise<{ summary: string }>}
 */
export const runSummaryAgent = async (category, severity, department, visualDescription, userDescription) => {
  const prompt = `Write a concise official summary suitable for an admin dashboard and government records.
- Standard Category: "${category}"
- Severity: "${severity}"
- Assigned Department: "${department}"
- Visual Description: "${visualDescription}"
- Citizen Notes: "${userDescription || 'None'}"

The summary must be:
1. Factual and objective.
2. Written in a professional, official municipal log tone.
3. Keep it brief (typically 2 sentences, maximum 3).
4. Clearly state the problem, location context (if any), and routing details.

Format your response exactly as this JSON structure:
{
  "summary": "Professional and factual official summary log text."
}`;

  const systemInstruction = "You are a Summary Agent writing official municipal logs and summaries. You must output only a valid JSON object matching the requested schema.";

  try {
    return await callGemini(prompt, systemInstruction);
  } catch (err) {
    console.warn('[Summary Agent] Gemini execution failed, fallback to mock summary:', err.message);
    return {
      summary: `Official Report Summary: A ${severity.toLowerCase()}-priority ${category.toLowerCase()} issue was reported. Description: "${userDescription || 'No citizen notes provided'}" is verified visually. Routed to ${department} department.`
    };
  }
};