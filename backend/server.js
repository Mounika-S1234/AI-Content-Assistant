require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const geminiApiKey = process.env.GEMINI_API_KEY;
const preferredModels = ['gemini-3.8-flash'];

app.use(cors());
app.use(express.json());

if (!geminiApiKey || geminiApiKey === 'your_actual_api_key_here') {
  console.error('Missing or invalid Gemini API key. Update backend/.env with your real Google AI Studio API key.');
}

const genAI = geminiApiKey && geminiApiKey !== 'your_actual_api_key_here' ? new GoogleGenerativeAI(geminiApiKey) : null;

function getGeminiErrorMessage(error) {
  const message = error && error.message ? error.message : '';

  if (/API key.*not valid|API_KEY_INVALID/i.test(message)) {
    return 'Gemini API key is invalid or expired. Open Google AI Studio, create a new API key, and paste it into backend/.env as GEMINI_API_KEY=your_key_here.';
  }

  if (/429|quota|billing|RESOURCE_EXHAUSTED/i.test(message)) {
    return 'Gemini quota or billing is exhausted. Turn on billing in Google AI Studio or wait for your limit to reset.';
  }

  if (/model.*not found|not found/i.test(message)) {
    return 'The selected Gemini model is unavailable. The app will retry with a supported model automatically.';
  }

  if (/fetch|network|ECONNRESET|timed out/i.test(message)) {
    return 'Network error while contacting Gemini. Please check your internet connection and try again.';
  }

  return 'Failed to generate content. Check your Gemini API key, Google AI Studio access, billing, and project settings.';
}

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!genAI || !geminiApiKey || geminiApiKey === 'your_actual_api_key_here') {
      return res.status(500).json({
        error: 'Gemini API key is missing or invalid. Open Google AI Studio, create a valid API key, and update backend/.env with it.'
      });
    }

    let lastError = null;

    for (const modelName of preferredModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ data: text });
      } catch (modelError) {
        lastError = modelError;
      }
    }

    throw lastError || new Error('Unknown Gemini error');
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({
      error: getGeminiErrorMessage(error)
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
