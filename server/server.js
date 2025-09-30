// BACKEND SERVER (server/server.js)
// Enhanced server with secure database integration for chatbot

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
  'http://localhost:5000',
  'http://localhost:5000/api/health'
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
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use((req, res, next) => {
  const csp = [
    "default-src 'self'",
    "connect-src 'self' blob: data: https://generativelanguage.googleapis.com https://*.sagradago.onrender.com https://*.sagradago-backend.onrender.com http://localhost:5000/api/health http://localhost:5173 http://localhost:5000 http://localhost:5001 https://*.supabase.co wss://*.supabase.co https://*.google.com https://www.google.com/recaptcha/",
    "script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/",
    "style-src 'self' 'unsafe-inline'",
    "frame-src https://www.google.com/recaptcha/",
    "img-src 'self' data:"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
});

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  next();
});

app.use(express.json());

// Log requests
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    if (req.url.startsWith('/api/') || req.method !== 'GET') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    }
  } else {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

app.use('/api', (req, res, next) => {
  console.log('🔗 [API REQUEST] Incoming request:');
  console.log(`  Method: ${req.method}`);
  console.log(`  URL: ${req.originalUrl}`);
  console.log(`  Origin: ${req.headers.origin || 'Not provided'}`);
  next();
});

// ===== Database Query Functions =====

/**
 * Securely fetch church events (public information)
 */
async function getChurchEvents() {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('events_tbl')
      .select(`
        event_name,
        event_description,
        event_date,
        event_time,
        location,
        event_type,
        max_participants,
        is_active
      `)
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    return null;
  }
}

/**
 * Securely fetch available sacrament services (public information)
 */
async function getSacramentServices() {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('sacrament_tbl')
      .select(`
        sacrament_name,
        description,
        requirements,
        fee,
        duration_minutes,
        is_active
      `)
      .eq('is_active', true)
      .order('sacrament_name', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching sacraments:', error);
    return null;
  }
}

/**
 * Get general statistics (non-sensitive aggregated data)
 */
async function getChurchStatistics() {
  if (!supabase) return null;
  
  try {
    const [eventsResult, sacramentsResult, usersResult] = await Promise.all([
      supabase.from('events_tbl').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('sacrament_tbl').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('user_tbl').select('*', { count: 'exact', head: true }).eq('user_type', 'client')
    ]);

    return {
      totalActiveEvents: eventsResult.count || 0,
      totalAvailableSacraments: sacramentsResult.count || 0,
      totalRegisteredParishioners: usersResult.count || 0
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return null;
  }
}

/**
 * Get upcoming mass schedules (if available in database)
 */
async function getMassSchedules() {
  if (!supabase) return null;
  
  try {
    // Assuming there's a mass_schedules table
    const { data, error } = await supabase
      .from('mass_schedules')
      .select(`
        day_of_week,
        time,
        mass_type,
        language,
        is_active
      `)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true });

    if (error && error.code !== 'PGRST116') { // Table doesn't exist
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching mass schedules:', error);
    return [];
  }
}

/**
 * Prepare context data for the AI assistant
 */
async function prepareContextData() {
  try {
    const [events, sacraments, statistics, massSchedules] = await Promise.all([
      getChurchEvents(),
      getSacramentServices(),
      getChurchStatistics(),
      getMassSchedules()
    ]);

    let context = `
CURRENT PARISH DATA (Updated: ${new Date().toISOString()}):

UPCOMING EVENTS:`;

    if (events && events.length > 0) {
      context += `\n${events.map(event => 
        `- ${event.event_name}: ${event.event_date} at ${event.event_time} (${event.location})\n  Description: ${event.event_description}\n  Type: ${event.event_type}\n  Max participants: ${event.max_participants || 'No limit'}`
      ).join('\n')}`;
    } else {
      context += '\nNo upcoming events currently scheduled.';
    }

    context += `\n\nAVAILABLE SACRAMENTS:`;
    if (sacraments && sacraments.length > 0) {
      context += `\n${sacraments.map(sacrament => 
        `- ${sacrament.sacrament_name}: ${sacrament.description}\n  Requirements: ${sacrament.requirements || 'Please inquire'}\n  Fee: ${sacrament.fee ? `₱${sacrament.fee}` : 'Please inquire'}\n  Duration: ${sacrament.duration_minutes ? `${sacrament.duration_minutes} minutes` : 'Varies'}`
      ).join('\n')}`;
    } else {
      context += '\nSacrament information not available. Please contact the parish office.';
    }

    if (massSchedules && massSchedules.length > 0) {
      context += `\n\nMASS SCHEDULES:`;
      const groupedSchedules = massSchedules.reduce((acc, schedule) => {
        if (!acc[schedule.day_of_week]) acc[schedule.day_of_week] = [];
        acc[schedule.day_of_week].push(schedule);
        return acc;
      }, {});

      Object.keys(groupedSchedules).forEach(day => {
        context += `\n${day}: ${groupedSchedules[day].map(s => `${s.time} (${s.mass_type}${s.language ? ` - ${s.language}` : ''})`).join(', ')}`;
      });
    }

    if (statistics) {
      context += `\n\nPARISH STATISTICS:
- Active Events: ${statistics.totalActiveEvents}
- Available Sacraments: ${statistics.totalAvailableSacraments}
- Registered Parishioners: ${statistics.totalRegisteredParishioners}`;
    }

    context += `\n\nIMPORTANT REMINDERS:
- For booking sacraments, users should use the "Book a Service" feature in SagradaGo
- For donations, users can use the donation feature in the system
- For specific inquiries, direct users to contact the parish office
- Never share personal information of parishioners
- Always maintain confidentiality and privacy`;

    return context;
  } catch (error) {
    console.error('Error preparing context data:', error);
    return 'Database context unavailable. Please provide general parish information.';
  }
}

// ===== Helper Functions =====
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
    
    console.log('Gemini API test successful');
    return true;
  } catch (error) {
    console.error('Gemini API test failed:', error.response?.data || error.message);
    return false;
  }
}

// ===== API Endpoints =====

// Enhanced chat endpoint with database context
const SYSTEM_PROMPT = `You are a helpful virtual assistant for Sagrada Familia Parish Church, located at Sagrada Familia Parish, Sanctuary of the Holy Face of Manoppello, Manila, Philippines.

You have access to real-time parish data and can help with:
• Current church events and schedules
• Available sacrament services and their requirements
• Mass times and parish activities
• Donation and volunteer opportunities
• General parish information and guidance
• Using the SagradaGo Parish Information System features

IMPORTANT SECURITY GUIDELINES:
- NEVER share personal information about parishioners (names, addresses, phone numbers, etc.)
- NEVER provide booking details of other people
- NEVER access or discuss private user data
- Only share publicly available parish information
- For booking services, direct users to use the "Book a Service" feature
- For private matters, direct users to contact the parish office directly

Always maintain confidentiality and respect privacy while providing helpful parish information.`;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

app.post('/api/gemini', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message?.trim()) {
      return res.status(400).json({
        error: 'Message is required',
        details: 'Please provide a non-empty message'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Get current database context
    console.log('🔍 Fetching database context for chatbot...');
    const contextData = await prepareContextData();
    
    // Enhanced system prompt with database context
    const enhancedSystemPrompt = `${SYSTEM_PROMPT}\n\n${contextData}`;

    // Format conversation history for Gemini API
    const contents = [
      {
        role: 'user',
        parts: [{ text: enhancedSystemPrompt }]
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

    // Send request to Gemini API
    const response = await axios.post(
      GEMINI_API_URL,
      { contents },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000 // Increased timeout for database queries
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
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Request timeout',
        details: 'The request took too long to process'
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

// reCAPTCHA verification endpoint
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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const requestOrigin = req.get('origin');
  console.log('🏥 [HEALTH CHECK] Request received from:', requestOrigin || 'unknown');
  
  // Test API connectivity
  const apiTest = await testGeminiAPI().catch(() => false);
  
  // Test database connectivity
  let dbTest = false;
  if (supabase) {
    try {
      const { error } = await supabase.from('events_tbl').select('*').limit(1);
      dbTest = !error;
    } catch (error) {
      console.error('Database test failed:', error);
    }
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
    databaseConnected: dbTest,
    environment: process.env.NODE_ENV || 'development',
    features: {
      chatbotWithDatabase: dbTest && apiTest,
      recaptchaVerification: !!process.env.RECAPTCHA_SECRET_KEY,
      userManagement: !!supabase
    }
  };

  res.json(response);
});

// User creation endpoint (existing code)
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

    if (!supabase) {
      return res.status(503).json({
        status: 'error',
        message: 'Service unavailable',
        details: 'Database connection not configured'
      });
    }

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

    const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `https://sagradago.online/set-password`
    });

    if (inviteError) {
      throw new Error(`Failed to create auth user: ${inviteError.message}`);
    }
    transaction.authUser = data.user;

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
    console.log('🔍 DIAGNOSTIC: Starting enhanced server with database integration...');
    console.log('='.repeat(60));
    
    console.log('📋 DIAGNOSTIC: Environment Variables Check:');
    console.log('  NODE_ENV:', process.env.NODE_ENV || 'undefined');
    console.log('  PORT:', process.env.PORT || 'undefined');
    console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ SET' : '❌ MISSING');
    console.log('  REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ SET' : '❌ MISSING');
    console.log('  REACT_SUPABASE_SERVICE_ROLE_KEY:', process.env.REACT_SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ MISSING');
    console.log('  Database Integration:', supabase ? '✅ ENABLED' : '❌ DISABLED');
    
    const requiredEnvVars = [
      'GEMINI_API_KEY', 
      'REACT_APP_SUPABASE_URL', 
      'REACT_SUPABASE_SERVICE_ROLE_KEY',
      'RECAPTCHA_SITE_KEY',
      'RECAPTCHA_SECRET_KEY'
    ];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      console.error('❌ CRITICAL ERROR: Missing required environment variables:', missingEnvVars.join(', '));
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    } else {
      console.log('✅ All required environment variables are present');
    }

    const server = app.listen(port, async () => {
      console.log('='.repeat(50));
      console.log(`🚀 Enhanced Server started successfully!`);
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database Integration: ${supabase ? 'ENABLED' : 'DISABLED'}`);
      console.log(`Health check: http://localhost:${port}/api/health`);

      // Test database connectivity
      if (supabase) {
        console.log('🔍 Testing database connectivity...');
        try {
          const contextData = await prepareContextData();
          console.log('✅ Database connectivity test successful');
          console.log('✅ Chatbot can now access parish data securely');
        } catch (error) {
          console.error('⚠️ Database connectivity test failed:', error.message);
        }
      }

      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) {
        try {
          const apiTest = await Promise.race([
            testGeminiAPI(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('API test timeout')), 5000))
          ]);

          if (!apiTest) {
            console.error('⚠️ Warning: Gemini API test failed. The chatbot may not work properly.');
          } else {
            console.log('✅ Gemini API test successful');
          }
        } catch (error) {
          console.error('⚠️ Error testing Gemini API:', error.message);
        }
      }

      console.log('='.repeat(50));
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    const shutdown = () => {
      console.log('\nShutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });

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