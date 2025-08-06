require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkAPIKey() {
  console.log('Checking Gemini API key...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ No API key found in .env file');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // First, list available models
    console.log('Fetching available models...');
    const models = await genAI.listModels();
    console.log('Available models:', models.map(m => m.name).join(', '));
    
    // Try to use gemini-1.0-pro instead of gemini-pro
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
      console.log('3. Copy the new key to your .env file');
    } else if (error.message.includes('404')) {
      console.log('\nModel not found error. This could mean:');
      console.log('1. The model name is incorrect');
      console.log('2. Your API key doesn\'t have access to this model');
      console.log('3. The API version is not compatible');
    }
    process.exit(1);
  }
}

checkAPIKey(); 