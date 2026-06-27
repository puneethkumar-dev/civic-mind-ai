import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

/**
 * Checks if the Gemini API is configured with a key.
 * @returns {boolean}
 */
export const isGeminiEnabled = () => {
  return typeof apiKey === 'string' && apiKey.trim().length > 0;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calls the Gemini API with structured prompt inputs, system instruction, optional image,
 * and handles timeouts, malformed JSON response parsing, and retries.
 * 
 * @param {string} prompt The text prompt
 * @param {string} systemInstruction Optional system directives
 * @param {Buffer} imageBuffer Optional binary image buffer
 * @param {string} mimeType Optional mime type for image
 * @param {number} maxRetries Maximum number of retries before throwing
 * @returns {Promise<any>} Parsed JSON response
 */
export const callGemini = async (prompt, systemInstruction = '', imageBuffer = null, mimeType = 'image/jpeg', maxRetries = 3) => {
  if (!isGeminiEnabled()) {
    throw new Error('Gemini API key is not configured.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelOptions = {
    model: 'gemini-1.5-flash',
  };

  if (systemInstruction) {
    modelOptions.systemInstruction = systemInstruction;
  }

  const model = genAI.getGenerativeModel(modelOptions);

  const contents = [];

  // Multimodal support: if image is present, convert to inline base64 data
  if (imageBuffer && imageBuffer.length > 0) {
    contents.push({
      inlineData: {
        data: Buffer.from(imageBuffer).toString('base64'),
        mimeType: mimeType || 'image/jpeg'
      }
    });
  }

  contents.push(prompt);

  const generationConfig = {
    responseMimeType: 'application/json',
  };

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const apiCall = model.generateContent({
        contents,
        generationConfig
      });

      // 15 second timeout for responsiveness
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API request timed out')), 15000)
      );

      const response = await Promise.race([apiCall, timeoutPromise]);
      const text = response.response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Failed to parse response text as JSON: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.warn(`[Gemini Client] Attempt ${attempt} failed: ${error.message}`);
      lastError = error;
      if (attempt < maxRetries) {
        // Exponential backoff: 2s, 4s, 8s...
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  throw lastError || new Error('Gemini API call failed after max retries.');
};
