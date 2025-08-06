const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log('Gemini API Key at startup:', GEMINI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Gemini chat endpoint
app.post('/api/gemini', async (req, res) => {
  const userMessage = req.body.message;
  const history = req.body.history || [];
  try {
    const contents = history.length > 0
      ? history.concat([{ role: 'user', parts: [{ text: userMessage }] }])
      : [{ parts: [{ text: userMessage }] }];
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    // Debug: print the outgoing request
    console.log('Sending to Gemini:', JSON.stringify({ contents }, null, 2));
    console.log('Using API Key:', GEMINI_API_KEY);
    const geminiResponse = await axios.post(
      geminiUrl,
      { contents },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );
    // Debug: print the response
    console.log('Gemini API response:', JSON.stringify(geminiResponse.data, null, 2));
    const candidates = geminiResponse.data.candidates;
    let geminiReply = 'Sorry, no response from Gemini.';
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts && candidates[0].content.parts[0].text) {
      geminiReply = candidates[0].content.parts[0].text;
    }
    res.json({ reply: geminiReply });
  } catch (err) {
    if (err.response) {
      console.error('Gemini API error:', JSON.stringify(err.response.data, null, 2));
      res.status(500).json({ reply: err.response.data.error?.message || 'Sorry, Gemini is unavailable.' });
    } else {
      console.error('Gemini API error:', err.message, err.stack);
      res.status(500).json({ reply: 'Sorry, Gemini is unavailable.' });
    }
  }
});

app.listen(5001, () => console.log('Gemini proxy running on port 5001'));