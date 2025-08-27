const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Create an Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://sagradago.online', 'sagradago.online'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// ===== Helper Functions =====
/**
 * Tests if the Gemini API is working by sending a simple "Hello" message
 * @returns {Promise<boolean>} True if the API test was successful
 */
async function testGeminiAPI() {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: "Hello" }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('Gemini API test successful. Response:', response.data);
    return true;
  } catch (error) {
    console.error('Gemini API test failed:', error.response?.data || error.message);
    return false;
  }
}

// ===== API Endpoints =====
/**
 * Chat endpoint that handles messages and returns AI responses
 * POST /
 * Body: { message: string, history: Array }
 */
app.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Validate input
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are a helpful virtual assistant for Sagrada Familia Parish Church, located at Sagrada Familia Parish, Sanctuary of the Holy Face of Manoppello, Manila, Philippines.
      You are an expert in both church-related matters in the Philippines and the SagradaGo Parish Information System. In SagradaGo, users can:
      • Book sacrament services — Wedding, Baptism, Confession, Anointing of the Sick, First Communion, and Burial — via the "Book a Service" feature.
      • View upcoming church events on the "Events" page.
      • Volunteer for church activities.
      • Donate to support the church.
      Only respond to questions related to the church or the SagradaGo system.
      If the user asks about anything unrelated (e.g., random topics, general knowledge, or other locations), politely reply that you can only assist with Sagrada Familia Parish and its services.
    `;

    // Format conversation history for Gemini API
    const contents = [
      { 
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...(history ? history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts[0].text }]
      })) : []),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    // Send request to Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    // Extract response text from Gemini API response
    const candidates = response.data.candidates;
    let reply = 'Sorry, no response from Gemini.';
    
    if (candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = candidates[0].content.parts[0].text;
    }

    res.json({ reply });
  } catch (error) {
    console.error('Error in /api/gemini:', error.response?.data || error);
    
    // Handle API errors
    if (error.response?.data?.error?.message) {
      return res.status(error.response.status).json({
        error: error.response.data.error.message,
        details: error.response.data
      });
    }
    
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
});

/**
 * Health check endpoint to verify server and API status
 * GET /health
 */
app.get('/health', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        status: 'error',
        error: 'GEMINI_API_KEY is not configured in environment variables.',
        apiKeyConfigured: false,
        apiTestSuccessful: false,
        details: 'Set GEMINI_API_KEY in your Netlify environment variables.'
      });
    }
    const apiTest = await testGeminiAPI();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      apiKeyConfigured: true,
      apiTestSuccessful: apiTest,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
      apiTestSuccessful: false,
      details: error.response?.data || error.stack
    });
  }
});

// Export the handler for Netlify Functions
exports.handler = serverless(app);