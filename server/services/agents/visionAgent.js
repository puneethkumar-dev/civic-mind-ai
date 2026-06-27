import { callGemini } from '../geminiClient.js';

/**
 * Stage 1: Vision Agent
 * Analyzes the uploaded image and user description to understand the issue and determine confidence.
 * 
 * @param {Buffer} imageBuffer Binary image file content
 * @param {string} mimeType Mime type of the image
 * @param {string} userDescription Optional citizen voice/text notes
 * @returns {Promise<{ visualDescription: string, confidence: number, predictedCategory: string }>}
 */
export const runVisionAgent = async (imageBuffer, mimeType, userDescription) => {
  const prompt = `Analyze the uploaded image and the citizen's optional description: "${userDescription || 'No description provided.'}".
Determine:
1. A concise, objective visual description of what is shown in the image.
2. The likely category of the issue.
3. A confidence score between 0 and 100 indicating how clear and identifiable the civic issue is from the image. If the image is blurry, irrelevant to civic issues, dark, or extremely ambiguous, return a low confidence score (e.g. below 70).

Format your response exactly as this JSON structure:
{
  "visualDescription": "Concise description of the visible issue",
  "confidence": 85,
  "predictedCategory": "One of: Road Damage, Water Leakage, Garbage, Streetlight, Drainage, Public Property Damage, Illegal Dumping, Other"
}`;

  const systemInstruction = "You are a professional Vision Agent analyzing citizen report images for municipal issues. You must output only a valid JSON object matching the requested schema.";

  return await callGemini(prompt, systemInstruction, imageBuffer, mimeType);
};
