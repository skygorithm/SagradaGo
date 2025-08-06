require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function verifyAPIKey() {
  console.log('Verifying Gemini API key...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ No API key found in .env file');
    process.exit(1);
  }

  // Check API key format
  if (!process.env.GEMINI_API_KEY.startsWith('AIza') || process.env.GEMINI_API_KEY.length !== 39) {
    console.error('❌ API key format appears invalid');
    console.log('A valid Gemini API key should:');
    console.log('1. Start with "AIza"');
    console.log('2. Be 39 characters long');
    console.log('3. Be obtained from https://makersuite.google.com/app/apikey');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    
    console.log('Testing API key with a simple request...');
    const result = await model.generateContent("Hello");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API key is valid!');
    console.log('Test response:', text);
    process.exit(0);
  } catch (error) {
    console.error('❌ API key validation failed:', error.message);
    if (error.message.includes('API key')) {
      console.log('\nPossible issues:');
      console.log('1. The API key is invalid or expired');
      console.log('2. The API key doesn\'t have the necessary permissions');
      console.log('3. The API key format is incorrect');
      console.log('\nTo fix this:');
      console.log('1. Go to https://makersuite.google.com/app/apikey');
      console.log('2. Create a new API key');
      console.log('3. Make sure to enable the Gemini API for your project');
      console.log('4. Copy the new key to your .env file');
    }
    process.exit(1);
  }
}

verifyAPIKey(); 