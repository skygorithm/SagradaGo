// BACKEND SERVER (server/server.js)
// This server handles API requests, including Gemini API integration, reCAPTCHA verification, and user management.

// Load environment variables from .env file
const { loadEnv } = require('../scripts/load-env');
loadEnv();
require('dotenv').config({ path: '.env' });
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
  
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://sagradago.online',
  'https://www.sagradago.online',
  'https://sagradago.netlify.app',
  'http://localhost:5001',
  'http://localhost:5000'
];

// ===== CORS CONFIGURATION =====
const corsOptions = {
  origin: (origin, callback) => {
    // Always allow requests without Origin header (mobile/curl)
    if (!origin) {
      console.log('🌐 [CORS] ✅ No origin header - allowed');
      return callback(null, true);
    }

    // Case-insensitive match against ALLOWED_ORIGINS
    const isAllowed = ALLOWED_ORIGINS.some(allowed => 
      allowed.toLowerCase() === origin.toLowerCase()
    );

    if (isAllowed) {
      console.log(`🌐 [CORS] ✅ Origin allowed: ${origin}`);
      return callback(null, true);
    }

    console.error(`🌐 [CORS] ❌ Blocked origin: ${origin}`);
    // Development override
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`🌐 [CORS] ⚠️ DEV: Allowing blocked origin`);
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// ===== CORRECT MIDDLEWARE ORDER =====
// 2.1 FIRST: Apply CORS middleware
app.use(cors(corsOptions));

// 2.2 SECOND: Explicitly handle OPTIONS preflight requests (MUST be right after CORS)
app.options('*', cors(corsOptions));

// 2.3 THIRD: Security headers (ONLY ONCE - NO DUPLICATES)
app.use((req, res, next) => {
  const csp = [
    "default-src 'self'",
    "connect-src 'self' https://generativelanguage.googleapis.com " +
    "https://sagradago.onrender.com " +               
    "https://sagradago-backend.onrender.com " +      
    "https://*.supabase.co wss://*.supabase.co " +
    "https://*.google.com https://www.google.com/recaptcha/",
    "script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/",
    "style-src 'self' 'unsafe-inline'",
    "frame-src https://www.google.com/recaptcha/",
    "img-src 'self' data:"
  ].join('; ');
  
  // Set ALL security headers together
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
});

// 2.4 FOURTH: Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  next();
});

// Body parser
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

// Add enhanced diagnostic logging for API requests
app.use('/api', (req, res, next) => {
  console.log('🔗 [API REQUEST] Incoming request:');
  console.log(`  Method: ${req.method}`);
  console.log(`  URL: ${req.originalUrl}`);
  console.log(`  Full URL: ${req.protocol}://${req.headers.host}${req.originalUrl}`);
  console.log(`  Host: ${req.headers.host}`);
  console.log(`  Origin: ${req.headers.origin || 'Not provided'}`);
  console.log(`  Referer: ${req.headers.referer || 'Not provided'}`);
  console.log(`  User-Agent: ${req.headers['user-agent'] || 'Not provided'}`);
  console.log(`  Content-Type: ${req.headers['content-type'] || 'Not provided'}`);
  console.log(`  X-Forwarded-Proto: ${req.headers['x-forwarded-proto'] || 'Not provided'}`);
  
  // Log if this looks like a CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('🔗 [API REQUEST] ⚠️  CORS Preflight detected');
    console.log(`  Access-Control-Request-Method: ${req.headers['access-control-request-method'] || 'Not provided'}`);
    console.log(`  Access-Control-Request-Headers: ${req.headers['access-control-request-headers'] || 'Not provided'}`);
  }
  
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
 * reCAPTCHA verification endpoint
 * POST /api/verify-recaptcha
 * Body: { token: string }
 */
app.post('/api/verify-recaptcha', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA token is required'
      });
    }

    if (!process.env.RECAPTCHA_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: 'reCAPTCHA not configured on server'
      });
    }

    // Verify with Google reCAPTCHA API
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { success, score, action } = response.data;

    // For reCAPTCHA v3, check score (0.0 = bot, 1.0 = human)
    if (success && (score === undefined || score >= 0.5)) {
      res.json({
        success: true,
        score: score,
        action: action
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification failed',
        score: score
      });
    }

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify reCAPTCHA'
    });
  }
});

/**
 * Health check endpoint to verify server and API status
 * GET /api/health
 */
app.get('/api/health', async (req, res) => {
  // const origin = req.get('origin');
  // const normalizedOrigin = origin ? origin.toLowerCase() : '';
  
  // // Explicitly set CORS headers for health check
  // if (origin && ALLOWED_ORIGINS.includes(normalizedOrigin)) {
  //   res.header('Access-Control-Allow-Origin', origin);
  //   res.header('Access-Control-Allow-Credentials', 'true');
  // }
  
  console.log('🏥 [HEALTH CHECK] Request received from:', origin || 'unknown');
  
  // Test API connectivity
  console.log('🏥 [HEALTH CHECK] Testing Gemini API connectivity...');
  const apiTest = await testGeminiAPI().catch((error) => {
    console.error('🏥 [HEALTH CHECK] ❌ API test failed:', error.message);
    return false;
  });

  if (apiTest) {
    console.log('🏥 [HEALTH CHECK] ✅ Gemini API test successful');
  }

  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    supabaseUrlConfigured: !!process.env.REACT_APP_SUPABASE_URL,
    supabaseServiceKeyConfigured: !!process.env.REACT_SUPABASE_SERVICE_ROLE_KEY,
    recaptchaSiteKeyConfigured: !!process.env.RECAPTCHA_SITE_KEY,
    recaptchaSecretKeyConfigured: !!process.env.RECAPTCHA_SECRET_KEY,
    apiTestSuccessful: apiTest,
    environment: process.env.NODE_ENV || 'development',
    serverHost: req.headers.host,
    serverUrl: `${req.protocol}://${req.headers.host}`,
    httpsEnabled: req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https',
    // Add diagnostic info
    diagnostics: {
      corsOrigins: ALLOWED_ORIGINS,
      memoryUsage: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      uptime: Math.round(process.uptime()) + 's',
      nodeVersion: process.version,
      platform: process.platform
    }
  };

  console.log('🏥 [HEALTH CHECK] Response prepared:', JSON.stringify(response, null, 2));
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
    console.log('='.repeat(60));
    console.log('🔍 DIAGNOSTIC: Starting server validation...');
    console.log('='.repeat(60));
    
    // Log all environment variables for debugging
    console.log('📋 DIAGNOSTIC: Environment Variables Check:');
    console.log('  NODE_ENV:', process.env.NODE_ENV || 'undefined');
    console.log('  PORT:', process.env.PORT || 'undefined');
    console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ SET (length: ' + process.env.GEMINI_API_KEY.length + ')' : '❌ MISSING');
    console.log('  REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ SET' : '❌ MISSING');
    console.log('  REACT_SUPABASE_SERVICE_ROLE_KEY:', process.env.REACT_SUPABASE_SERVICE_ROLE_KEY ? '✅ SET (length: ' + process.env.REACT_SUPABASE_SERVICE_ROLE_KEY.length + ')' : '❌ MISSING');
    console.log('  RECAPTCHA_SITE_KEY:', process.env.RECAPTCHA_SITE_KEY ? '✅ SET (length: ' + process.env.RECAPTCHA_SITE_KEY.length + ')' : '❌ MISSING');
    console.log('  RECAPTCHA_SECRET_KEY:', process.env.RECAPTCHA_SECRET_KEY ? '✅ SET (length: ' + process.env.RECAPTCHA_SECRET_KEY.length + ')' : '❌ MISSING');
    
    // Log process information
    console.log('🖥️  DIAGNOSTIC: Process Information:');
    console.log('  Node Version:', process.version);
    console.log('  Platform:', process.platform);
    console.log('  Architecture:', process.arch);
    console.log('  Memory Usage:', Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB');
    console.log('  Working Directory:', process.cwd());
    
    // Validate required environment variables
    const requiredEnvVars = [
      'GEMINI_API_KEY', 
      'REACT_APP_SUPABASE_URL', 
      'REACT_SUPABASE_SERVICE_ROLE_KEY',
      'RECAPTCHA_SITE_KEY',
      'RECAPTCHA_SECRET_KEY'
    ];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    console.log('🔐 DIAGNOSTIC: Environment Variables Validation:');
    if (missingEnvVars.length > 0) {
      console.error('❌ CRITICAL ERROR: Missing required environment variables:', missingEnvVars.join(', '));
      console.error('🚨 This will cause deployment failure on Render');
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    } else {
      console.log('✅ All required environment variables are present');
    }

    // Start server
    const server = app.listen(port, async () => {
      console.log('='.repeat(50));
      console.log(`Server started successfully!`);
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${port}/api/health`);
      console.log(`HTTPS redirect: ${process.env.NODE_ENV === 'production' ? 'ENABLED' : 'DISABLED'}`);

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