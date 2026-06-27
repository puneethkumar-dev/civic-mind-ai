import { callGemini } from '../geminiClient.js';

/**
 * Stage 3: Priority Agent
 * Determines severity (Low, Medium, High, Critical) based on safety risks and impact on daily life.
 * 
 * @param {string} category The standardized category
 * @param {string} visualDescription Factual description from Vision Agent
 * @param {string} userDescription Citizen text/voice notes
 * @returns {Promise<{ severity: string, urgencyReason: string }>}
 */
export const runPriorityAgent = async (category, visualDescription, userDescription) => {
  const prompt = `Assess the severity and urgency of the reported issue.
- Standard Category: "${category}"
- Visual Description: "${visualDescription}"
- Citizen Notes: "${userDescription || 'None'}"

Determine:
1. Severity level (must be exactly one of: Low, Medium, High, Critical).
   - Critical: Severe public safety hazard, live electricity exposing risk, fast-flowing water flooding homes, major drainage blockage causing flooding, or blockage of main roadways.
   - High: Obstructive road damage, major water main leak, overflowing garbage dumping near public areas, blockages affecting utility.
   - Medium: Moderate potholes, single dark streetlight, minor trash buildup, property damage not threatening public safety.
   - Low: Minor cosmetic defects, minor litter, low-impact issues.
2. Urgency Reason: A brief professional explanation of the safety or risk factors that justify the severity.

Format your response exactly as this JSON structure:
{
  "severity": "High",
  "urgencyReason": "Explain the safety or risk factors justifying the severity."
}`;

  const systemInstruction = "You are a Priority Agent assessing safety risks and severity levels of municipal issues. You must output only a valid JSON object matching the requested schema.";

  return await callGemini(prompt, systemInstruction);
};
