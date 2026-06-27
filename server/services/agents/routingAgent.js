import { callGemini } from '../geminiClient.js';

/**
 * Stage 4: Routing Agent
 * Assigns the issue to the responsible department and provides a routing reason.
 * 
 * @param {string} category The standardized category
 * @param {string} severity The priority level
 * @param {string} visualDescription Factual description from Vision Agent
 * @param {string} userDescription Citizen notes
 * @returns {Promise<{ department: string, routingReason: string }>}
 */
export const runRoutingAgent = async (category, severity, visualDescription, userDescription) => {
  const prompt = `Determine the responsible department to resolve the reported issue.
- Category: "${category}"
- Severity: "${severity}"
- Visual Description: "${visualDescription}"
- Citizen Notes: "${userDescription || 'None'}"

Assign the issue to exactly one of the following departments:
- Roads (for potholes, road cracks, road signs, and street infrastructure damage)
- Water Supply (for water leakage, pipe bursts, clogged sewers, drainage overflows)
- Sanitation (for garbage collection, overflowing waste containers, illegal dumping piles)
- Electricity (for broken streetlights, dark lamps, dangling wires, electric poles)
- Municipality (for public parks, community playground damage, and general urban complaints)

Format your response exactly as this JSON structure:
{
  "department": "Roads",
  "routingReason": "Provide a brief reason why this department was selected based on the issue description."
}`;

  const systemInstruction = "You are a Routing Agent assigning municipal reports to the correct division. You must output only a valid JSON object matching the requested schema.";

  return await callGemini(prompt, systemInstruction);
};
