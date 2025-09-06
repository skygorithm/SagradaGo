// scripts/load-env.js
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

/**
 * Loads environment variables from .env files
 * First tries .env.[NODE_ENV], then falls back to .env
 */
function loadEnv() {
  // Determine which .env file to load
  const envFile = process.env.NODE_ENV 
    ? `.env.${process.env.NODE_ENV}` 
    : '.env';
  
  // Check if the specific env file exists
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    console.log(`✅ Loading environment variables from ${envFile}`);
    dotenv.config({ path: envPath });
  } else {
    // Fall back to default .env
    console.log('✅ Loading environment variables from .env');
    dotenv.config();
  }
  
  // Log environment status for debugging
  console.log('📋 Environment variables loaded:');
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  PORT: ${process.env.PORT || '5001'}`);
  console.log(`  GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  Supabase URL: ${process.env.REACT_APP_SUPABASE_URL ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  Supabase Service Key: ${process.env.REACT_SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  reCAPTCHA Site Key: ${process.env.RECAPTCHA_SITE_KEY ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  reCAPTCHA Secret Key: ${process.env.RECAPTCHA_SECRET_KEY ? '✅ SET' : '❌ MISSING'}`);
}

module.exports = { loadEnv };