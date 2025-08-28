#!/usr/bin/env node

/**
 * Render Deployment Configuration Analyzer
 * Analyzes potential issues with Render backend deployment
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🔍 Render Backend Deployment Analysis');
console.log('=' .repeat(60));

// Analysis categories
const issues = {
  critical: [],
  warnings: [],
  suggestions: []
};

function addIssue(level, category, description, solution) {
  issues[level].push({
    category,
    description,
    solution
  });
}

// Check render.yaml configuration
function analyzeRenderConfig() {
  console.log('\n📋 Analyzing render.yaml configuration...');
  
  try {
    const renderYaml = fs.readFileSync('../render.yaml', 'utf8');
    console.log('✅ render.yaml found');
    
    // Check for common issues
    if (renderYaml.includes('rootDir: server')) {
      console.log('✅ Root directory correctly set to server');
    } else {
      addIssue('critical', 'Configuration', 
        'rootDir not set to server in render.yaml',
        'Add "rootDir: server" to backend service configuration');
    }
    
    if (renderYaml.includes('buildCommand: npm install')) {
      console.log('⚠️  Build command uses npm install (consider npm ci for production)');
      addIssue('warnings', 'Build', 
        'Using npm install instead of npm ci',
        'Change to "buildCommand: npm ci" for more reliable builds');
    }
    
    if (renderYaml.includes('startCommand: node server.js')) {
      console.log('✅ Start command correctly set to node server.js');
    } else if (renderYaml.includes('startCommand: npm start')) {
      addIssue('warnings', 'Start Command', 
        'Using npm start instead of direct node command',
        'Consider changing to "startCommand: node server.js" for better control');
    }
    
  } catch (error) {
    addIssue('critical', 'Configuration', 
      'render.yaml file not found or unreadable',
      'Ensure render.yaml exists in project root');
  }
}

// Check server directory structure
function analyzeServerStructure() {
  console.log('\n📁 Analyzing server directory structure...');
  
  const serverDir = './';
  const requiredFiles = ['server.js', 'package.json'];
  
  for (const file of requiredFiles) {
    const filePath = path.join(serverDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} found`);
    } else {
      addIssue('critical', 'File Structure', 
        `Missing required file: ${file}`,
        `Ensure ${file} exists in server directory`);
    }
  }
}

// Check package.json configuration
function analyzePackageJson() {
  console.log('\n📦 Analyzing server package.json...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    // Check main field
    if (packageJson.main === 'server.js') {
      console.log('✅ Main field correctly set to server.js');
    } else {
      addIssue('warnings', 'Package Config', 
        'Main field not set to server.js',
        'Set "main": "server.js" in package.json');
    }
    
    // Check start script
    if (packageJson.scripts && packageJson.scripts.start === 'node server.js') {
      console.log('✅ Start script correctly configured');
    } else {
      addIssue('warnings', 'Package Config', 
        'Start script not set to "node server.js"',
        'Set start script to "node server.js" in package.json');
    }
    
    // Check dependencies
    const requiredDeps = ['express', 'cors', 'dotenv', 'axios'];
    const missing = requiredDeps.filter(dep => !packageJson.dependencies || !packageJson.dependencies[dep]);
    
    if (missing.length === 0) {
      console.log('✅ All required dependencies present');
    } else {
      addIssue('critical', 'Dependencies', 
        `Missing dependencies: ${missing.join(', ')}`,
        `Install missing dependencies: npm install ${missing.join(' ')}`);
    }
    
  } catch (error) {
    addIssue('critical', 'Package Config', 
      'server/package.json not found or invalid',
      'Ensure valid package.json exists in server directory');
  }
}

// Check environment variables setup
function analyzeEnvironmentVars() {
  console.log('\n🔑 Analyzing environment variables...');
  
  const requiredVars = [
    'GEMINI_API_KEY',
    'REACT_APP_SUPABASE_URL', 
    'REACT_SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  // Check if vars are defined in render.yaml
  try {
    const renderYaml = fs.readFileSync('../render.yaml', 'utf8');
    
    for (const varName of requiredVars) {
      if (renderYaml.includes(`key: ${varName}`)) {
        console.log(`✅ ${varName} defined in render.yaml`);
      } else {
        addIssue('critical', 'Environment', 
          `Missing environment variable: ${varName}`,
          `Add ${varName} to render.yaml envVars section`);
      }
    }
  } catch (error) {
    console.log('❌ Could not check render.yaml for environment variables');
  }
}

// Check for common Node.js deployment issues
function analyzeNodeJsIssues() {
  console.log('\n🟢 Analyzing Node.js deployment issues...');
  
  // Check for production optimizations
  if (fs.existsSync('./server.js')) {
    const serverContent = fs.readFileSync('./server.js', 'utf8');
    
    if (serverContent.includes('process.env.NODE_ENV === \'production\'')) {
      console.log('✅ Production environment checks found');
    } else {
      addIssue('warnings', 'Node.js', 
        'No production environment checks found',
        'Add production-specific optimizations in server.js');
    }
    
    if (serverContent.includes('process.on(\'uncaughtException\'')) {
      console.log('✅ Uncaught exception handler found');
    } else {
      addIssue('suggestions', 'Node.js', 
        'No uncaught exception handler',
        'Add process.on(\'uncaughtException\') handler for better error tracking');
    }
  }
}

// Test local server startup
function testLocalStartup() {
  console.log('\n🚀 Testing local server startup simulation...');
  
  try {
    // Simulate the startup process
    const requiredEnvVars = ['GEMINI_API_KEY', 'REACT_APP_SUPABASE_URL', 'REACT_SUPABASE_SERVICE_ROLE_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log(`⚠️  Missing env vars for local test: ${missingVars.join(', ')}`);
      addIssue('warnings', 'Local Test', 
        'Cannot fully test startup due to missing environment variables',
        'Set environment variables for complete local testing');
    } else {
      console.log('✅ All environment variables available for testing');
    }
    
  } catch (error) {
    addIssue('warnings', 'Local Test', 
      'Error during local startup simulation',
      'Check server.js for syntax errors or missing dependencies');
  }
}

// Generate deployment diagnosis
function generateDiagnosis() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT DIAGNOSIS REPORT');
  console.log('='.repeat(60));
  
  // Critical issues
  if (issues.critical.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES (Must fix for deployment to work):');
    issues.critical.forEach((issue, index) => {
      console.log(`\n${index + 1}. [${issue.category}] ${issue.description}`);
      console.log(`   💡 Solution: ${issue.solution}`);
    });
  }
  
  // Warnings
  if (issues.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (Should fix for optimal deployment):');
    issues.warnings.forEach((issue, index) => {
      console.log(`\n${index + 1}. [${issue.category}] ${issue.description}`);
      console.log(`   💡 Solution: ${issue.solution}`);
    });
  }
  
  // Suggestions
  if (issues.suggestions.length > 0) {
    console.log('\n💡 SUGGESTIONS (Nice to have improvements):');
    issues.suggestions.forEach((issue, index) => {
      console.log(`\n${index + 1}. [${issue.category}] ${issue.description}`);
      console.log(`   💡 Solution: ${issue.solution}`);
    });
  }
  
  // Overall assessment
  console.log('\n' + '='.repeat(60));
  console.log('🎯 DEPLOYMENT READINESS ASSESSMENT');
  console.log('='.repeat(60));
  
  if (issues.critical.length === 0) {
    console.log('✅ READY FOR DEPLOYMENT - No critical issues found');
    console.log('   The backend should deploy successfully to Render');
  } else {
    console.log('❌ NOT READY FOR DEPLOYMENT - Critical issues must be resolved');
    console.log(`   Found ${issues.critical.length} critical issue(s) blocking deployment`);
  }
  
  console.log(`\nIssue Summary:`);
  console.log(`  🚨 Critical: ${issues.critical.length}`);
  console.log(`  ⚠️  Warnings: ${issues.warnings.length}`);
  console.log(`  💡 Suggestions: ${issues.suggestions.length}`);
  
  // Next steps
  console.log('\n📋 RECOMMENDED NEXT STEPS:');
  if (issues.critical.length > 0) {
    console.log('1. Fix all critical issues listed above');
    console.log('2. Commit and push changes to trigger new Render deployment');
    console.log('3. Monitor Render deployment logs for success');
    console.log('4. Test API endpoint: https://sagradago-backend.onrender.com/api/health');
  } else {
    console.log('1. Address warning issues for better reliability');
    console.log('2. Force redeploy on Render dashboard if service still returns 404');
    console.log('3. Check Render service logs for runtime errors');
    console.log('4. Verify all environment variables are set in Render dashboard');
  }
}

// Run all analyses
async function runAnalysis() {
  try {
    analyzeRenderConfig();
    analyzeServerStructure();
    analyzePackageJson();
    analyzeEnvironmentVars();
    analyzeNodeJsIssues();
    testLocalStartup();
    generateDiagnosis();
  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
  }
}

// Execute analysis
runAnalysis();