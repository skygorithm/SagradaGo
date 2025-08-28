// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// ===== Server Configuration =====
const app = express();
const port = process.env.PORT || 5001;
const hasSupabaseConfig = !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_SUPABASE_SERVICE_ROLE_KEY);
const supabase = hasSupabaseConfig
  ? createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Log server configuration
console.log('Environment check:');
console.log('- PORT:', process.env.PORT || 5001);
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- API Key configured:', !!process.env.GEMINI_API_KEY);
console.log('- Supabase URL:', process.env.REACT_APP_SUPABASE_URL ? 'Configured' : 'Not configured');
console.log('- Supabase Service Role Key:', process.env.REACT_SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Not configured');

// ===== Middleware Setup =====
// Configure CORS
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'https://sagradago.onrender.com',
  'https://sagradago.online',
  'https://www.sagradago.online',
  'https://sagradago.netlify.app'
]);

const corsOptions = {
  origin: function(origin, callback) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Only log CORS issues in production, or all in development
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      if (!isProduction && origin) {
        console.log('CORS check - Origin allowed:', origin);
      }
      callback(null, true);
    } else {
      if (isProduction) {
        console.error('CORS blocked origin:', origin);
      } else {
        console.log('CORS check - Origin:', origin);
        console.log('CORS check - Allowed origins:', Array.from(ALLOWED_ORIGINS));
        console.log('CORS check - Origin blocked:', origin || 'null origin');
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Enable CORS with our configuration
app.use(cors(corsOptions));

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Parse JSON request bodies
app.use(express.json());

// Log all incoming requests (optimized for production)
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, only log errors and important requests
  if (isProduction) {
    // Only log API requests and potential issues
    if (req.url.startsWith('/api/') || req.method !== 'GET') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    }
  } else {
    // Development: keep detailed logging
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log(`Host header: ${req.headers.host}`);
    console.log(`Origin header: ${req.headers.origin}`);
    console.log(`User-Agent: ${req.headers['user-agent']}`);

    // Log memory usage in development
    const memUsage = process.memoryUsage();
    console.log(`Memory Usage - RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)}MB, Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB, Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`);

    if (req.method === 'POST') {
      const bodySize = JSON.stringify(req.body).length;
      console.log(`Request body size: ${(bodySize / 1024).toFixed(2)}KB`);
      // Only log body if it's not too large to prevent memory issues
      if (bodySize < 10000) { // 10KB limit
        console.log('Request body:', JSON.stringify(req.body, null, 2));
      } else {
        console.log('Request body too large to log (size > 10KB)');
      }
    }
  }
  next();
});
// TEMPORARILY DISABLE API REDIRECT FOR DEBUGGING
// This redirect was causing infinite loops
/*
app.use('/api', (req, res, next) => {
  const target = `https://sagradago.onrender.com${req.originalUrl}`;
  console.log(`Redirecting API request to ${target}`);
  res.redirect(307, target);
});
*/

// Add diagnostic logging for API requests
app.use('/api', (req, res, next) => {
  console.log(`[API REQUEST] ${req.method} ${req.originalUrl}`);
  console.log(`[API REQUEST] Host: ${req.headers.host}`);
  console.log(`[API REQUEST] Origin: ${req.headers.origin}`);
  console.log(`[API REQUEST] User-Agent: ${req.headers['user-agent']}`);
  next();
});

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
 * POST /api/gemini
 * Body: { message: string, history: Array }
 */
// Cache system prompt
const SYSTEM_PROMPT = `You are a helpful virtual assistant for Sagrada Familia Parish Church, located at Sagrada Familia Parish, Sanctuary of the Holy Face of Manoppello, Manila, Philippines.
  You are an expert in both church-related matters in the Philippines and the SagradaGo Parish Information System. In SagradaGo, users can:
  • Book sacrament services — Wedding, Baptism, Confession, Anointing of the Sick, First Communion, and Burial — via the "Book a Service" feature.
  • View upcoming church events on the "Events" page.
  • Volunteer for church activities.
  • Donate to support the church.
  Only respond to questions related to the church or the SagradaGo system.
  If the user asks about anything unrelated (e.g., random topics, general knowledge, or other locations), politely reply that you can only assist with Sagrada Familia Parish and its services.
`;

// Cache Gemini API URL
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

app.post('/api/gemini', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Validate input
    if (!message?.trim()) {
      return res.status(400).json({
        error: 'Message is required',
        details: 'Please provide a non-empty message'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Format conversation history for Gemini API
    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      },
      ...(Array.isArray(history) ? history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts[0].text }]
      })) : []),
      {
        role: 'user',
        parts: [{ text: message.trim() }]
      }
    ];

    // Send request to Gemini API with timeout
    const response = await axios.post(
      GEMINI_API_URL,
      { contents },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10 second timeout
      }
    );

    // Extract and validate response
    const candidates = response.data?.candidates;
    if (!candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    res.json({ reply: candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Error in /api/gemini:', error.response?.data || error);
    
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Request timeout',
        details: 'The request to Gemini API timed out'
      });
    }
    
    if (error.response?.data?.error) {
      return res.status(error.response.status || 500).json({
        error: error.response.data.error.message || 'Gemini API error',
        details: error.response.data
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * Health check endpoint to verify server and API status
 * GET /api/health
 */
app.get('/api/health', async (req, res) => {
  console.log('[HEALTH CHECK] Request received');
  console.log('[HEALTH CHECK] Environment variables:');
  console.log('  - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Configured' : 'NOT CONFIGURED');
  console.log('  - REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? 'Configured' : 'NOT CONFIGURED');
  console.log('  - REACT_SUPABASE_SERVICE_ROLE_KEY:', process.env.REACT_SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'NOT CONFIGURED');
  console.log('  - NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('  - PORT:', process.env.PORT || 5001);

  const apiTest = await testGeminiAPI().catch((error) => {
    console.error('[HEALTH CHECK] API test failed:', error.message);
    return false;
  });

  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    supabaseUrlConfigured: !!process.env.REACT_APP_SUPABASE_URL,
    supabaseServiceKeyConfigured: !!process.env.REACT_SUPABASE_SERVICE_ROLE_KEY,
    apiTestSuccessful: apiTest,
    environment: process.env.NODE_ENV || 'development',
    serverHost: req.headers.host,
    serverUrl: `${req.protocol}://${req.headers.host}`
  };

  console.log('[HEALTH CHECK] Response:', JSON.stringify(response, null, 2));
  res.json(response);
});

// User creation endpoint
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const createUserRecord = async (supabase, userId, email) => {
  const timestamp = new Date().toISOString();
  const userData = {
    id: userId,
    email: email,
    created_at: timestamp,
    updated_at: timestamp,
    user_type: 'client',
    is_verified: false,
    registration_status: 'pending',
    verification_sent_at: timestamp,
    last_login: null
  };

  const { error } = await supabase.from('user_tbl').insert([userData]);
  if (error) {
    throw new Error(`Failed to create user record: ${error.message}`);
  }
  return userData;
};

app.post('/admin/createUser', async (req, res) => {
  const transaction = { authUser: null, dbUser: null };

  try {
    // Input validation
    const { email, randomPassword } = req.body;
    if (!email || !randomPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
        details: 'Both email and password must be provided'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    // Check Supabase configuration
    if (!supabase) {
      return res.status(503).json({
        status: 'error',
        message: 'Service unavailable',
        details: 'Database connection not configured'
      });
    }

    // Check existing user with transaction-like behavior
    const [{ data: existingUser }, { data: authData }] = await Promise.all([
      supabase.from('user_tbl').select('*').eq('email', email).single(),
      supabase.auth.admin.listUsers()
    ]);

    const existingAuthUser = authData?.users?.find(u => u.email === email);

    if (existingUser || existingAuthUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User already exists',
        details: existingUser?.is_verified
          ? 'Email is already registered and verified'
          : 'Email is registered but pending verification'
      });
    }

    // Create auth user with invitation
    const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `https://sagradago.online/set-password`
    });

    if (inviteError) {
      throw new Error(`Failed to create auth user: ${inviteError.message}`);
    }
    transaction.authUser = data.user;

    // Create user record
    const userRecord = await createUserRecord(supabase, data.user.id, email);
    transaction.dbUser = userRecord;

    res.json({
      status: 'success',
      message: 'User created successfully',
      details: 'Invitation email sent with password setup link',
      user: data.user
    });

  } catch (error) {
    console.error('User creation error:', error);

    // Rollback if partial creation occurred
    if (transaction.authUser && !transaction.dbUser) {
      try {
        await supabase.auth.admin.deleteUser(transaction.authUser.id);
        console.log('Rolled back auth user creation');
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
      details: error.message
    });
  }
});

// ===== Server Startup =====
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const startServer = async () => {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['GEMINI_API_KEY', 'REACT_APP_SUPABASE_URL', 'REACT_SUPABASE_SERVICE_ROLE_KEY'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Start server
    const server = app.listen(port, async () => {
      console.log('='.repeat(50));
      console.log(`Server started successfully!`);
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${port}/api/health`);

      // Skip API test in production to speed up startup
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) {
        try {
          // Test API on startup with timeout
          const apiTest = await Promise.race([
            testGeminiAPI(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('API test timeout')), 5000))
          ]);

          if (!apiTest) {
            console.error('⚠️ Warning: Gemini API test failed. The chatbot may not work properly.');
            console.error('Please check your API key and try again.');
          } else {
            console.log('✅ Gemini API test successful');
          }
        } catch (error) {
          console.error('⚠️ Error testing Gemini API:', error.message);
        }
      } else {
        console.log('ℹ️ Production mode: Skipping startup API test for faster deployment');
      }

      console.log('='.repeat(50));
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('\nShutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });

      // Force close after 10s
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();