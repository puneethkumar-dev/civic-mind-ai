import { callGemini } from '../geminiClient.js';

/**
 * Stage 2: Categorization Agent
 * Maps the issue to one of the 8 supported categories.
 * 
 * @param {string} visualDescription Factual description from Vision Agent
 * @param {string} userDescription Optional citizen description
 * @param {string} predictedCategory The first guess category from Vision Agent
 * @param {string|null} clarificationCategory User choice if low confidence was triggered
 * @returns {Promise<{ category: string, confidence: number }>}
 */
export const runCategorizationAgent = async (visualDescription, userDescription, predictedCategory, clarificationCategory = null) => {
  if (clarificationCategory) {
    console.log(`[Categorization Agent] Using user clarified category: ${clarificationCategory}`);
    return {
      category: clarificationCategory,
      confidence: 100
    };
  }

  const prompt = `Based on:
- Visual Description: "${visualDescription}"
- Citizen Notes: "${userDescription || 'None'}"
- Initial Prediction: "${predictedCategory}"

Determine which of the following standard categories best fits this issue:
- Road Damage
- Water Leakage
- Garbage
- Streetlight
- Drainage
- Public Property Damage
- Illegal Dumping
- Other

Provide a confidence score (0 to 100) for this categorization.

Format your response exactly as this JSON structure:
{
  "category": "Road Damage",
  "confidence": 95
}`;

  const systemInstruction = "You are a Categorization Agent for a civic portal. You map issues to standard categories. You must output only a valid JSON object matching the requested schema.";

  return await callGemini(prompt, systemInstruction);
};
