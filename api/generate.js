const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL_NAME = 'gemini-3.8-flash';

function getPublicErrorMessage(error) {
  const message = error && error.message ? error.message : '';

  if (/API key.*not valid|API_KEY_INVALID/i.test(message)) {
    return 'The Gemini API key is invalid or expired. Update GEMINI_API_KEY in the Vercel project settings.';
  }
  if (/429|quota|billing|RESOURCE_EXHAUSTED/i.test(message)) {
    return 'Gemini quota or billing is unavailable. Check the Google AI Studio project and try again.';
  }
  if (/model.*not found|not found/i.test(message)) {
    return `The Gemini model ${MODEL_NAME} is unavailable for this API key.`;
  }
  if (/fetch|network|ECONNRESET|timed out/i.test(message)) {
    return 'A network error occurred while contacting Gemini. Please try again.';
  }
  return 'Gemini could not generate content. Check the API key, model access, and project settings.';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt) {
    return res.status(400).json({ error: 'Enter a prompt before generating content.' });
  }
  if (prompt.length > 5000) {
    return res.status(400).json({ error: 'Prompt must be 5000 characters or fewer.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server setup is incomplete: GEMINI_API_KEY is not configured in Vercel.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();
    return res.status(200).json({ data: text });
  } catch (error) {
    console.error('Gemini generation failed:', error && error.message ? error.message : 'Unknown provider error');
    return res.status(502).json({ error: getPublicErrorMessage(error) });
  }
};
