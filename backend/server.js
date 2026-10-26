require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const geminiApiKey = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

if (!geminiApiKey || geminiApiKey === 'your_actual_api_key_here') {
  console.error('Missing or invalid Gemini API key. Update backend/.env with your real Google AI Studio API key.');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!geminiApiKey || geminiApiKey === 'your_actual_api_key_here') {
      return res.status(500).json({
        error: 'Gemini API key is missing or invalid. Please update backend/.env with your real Google AI Studio API key.'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ data: text });
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({
      error: 'Failed to generate content. Check your Gemini API key and internet connection.'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
