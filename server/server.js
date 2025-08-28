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
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://sagradago.onrender.com',
      'https://sagradago.online',
      'https://www.sagradago.online',
      'https://sagradago.netlify.app',
      'https://sagradago-backend.onrender.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
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

// Parse JSON request bodies
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Log memory usage
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
app.post('/api/gemini', async (req, res) => {
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
 * GET /api/health
 */
app.get('/api/health', async (req, res) => {
  const apiTest = await testGeminiAPI().catch(() => false);
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    apiTestSuccessful: apiTest,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post('/admin/createUser', async (req, res) => {
  try {
    const { email, randomPassword } = req.body;
    if (!email || !randomPassword) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email and random password are required',
        user: null,
        details: 'Missing email or random password in request body'
      });
    }
    if (!supabase) {
      return res.status(503).json({
        status: 'error',
        message: 'Supabase is not configured on this server',
        user: null,
        details: 'Missing REACT_APP_SUPABASE_URL or REACT_SUPABASE_SERVICE_ROLE_KEY'
      });
    }

    // Check if user exists and their verification status
    const { data: existingUser, error: userError } = await supabase
      .from('user_tbl')
      .select('*')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking existing user:', userError);
      return res.status(500).json({
        status: 'error',
        message: 'Error checking user status',
        details: userError,
        user: null
      });
    }

    // Check if user exists in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    const existingAuthUser = authUser?.users?.find(u => u.email === email);

    if (existingUser || existingAuthUser) {
      const status = {
        isRegistered: !!existingUser,
        isVerified: existingUser?.is_verified || false,
        hasAuthAccount: !!existingAuthUser
      };

      // Different error messages based on user status
      if (status.isRegistered && status.isVerified) {
        return res.status(400).json({
          status: 'error',
          message: 'User already exists and is verified',
          details: 'This email is already registered and verified in the system.',
          user: null
        });
      } else if (status.isRegistered && !status.isVerified) {
        return res.status(400).json({
          status: 'error',
          message: 'User exists but is not verified',
          details: 'This email is registered but pending verification. Please check your email for the verification link.',
          user: null
        });
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid user state',
          details: 'User account is in an invalid state. Please contact support.',
          user: null
        });
      }
    }

    // Create the auth user and send invitation
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `https://sagradago.online/set-password`,
    });

    if (error) {
      console.error('Error from Supabase:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message,
        details: error,
        user: null
      });
    }

    try {
      // Create user record in user_tbl with the same ID
      const { error: userError } = await supabase
        .from('user_tbl')
        .insert([
          {
            id: data.user.id,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_type: 'client',
            is_verified: false,
            registration_status: 'pending', // Track registration status
            verification_sent_at: new Date().toISOString(),
            last_login: null
          }
        ]);

      if (userError) {
        console.error('Error creating user record:', userError);
        // Attempt to clean up the auth user if user_tbl insert fails
        await supabase.auth.admin.deleteUser(data.user.id);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create user record',
          details: userError,
          user: null
        });
      }

      res.json({
        status: 'success',
        message: 'User has been invited to join SagradaGo. They are sent an invite link to set their password before accessing the system.',
        details: 'User has been created and invited to join SagradaGo',
        user: data.user
      });
    } catch (insertError) {
      console.error('Error in user creation:', insertError);
      // Attempt to clean up the auth user if something goes wrong
      await supabase.auth.admin.deleteUser(data.user.id);
      throw insertError;
    }

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Failed to create user',
      details: error.response?.data || error.stack ,
      user: null
    });
  }
});

// ===== Server Startup =====
const server = app.listen(port, async () => {
  console.log('='.repeat(50));
  console.log(`Server started successfully!`);
  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  
  // Test API on startup
  const apiTest = await testGeminiAPI();
  if (!apiTest) {
    console.error('⚠️ Warning: Gemini API test failed. The chatbot may not work properly.');
    console.error('Please check your API key and try again.');
  } else {
    console.log('✅ Gemini API test successful');
  }
  console.log('='.repeat(50));
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
}); 