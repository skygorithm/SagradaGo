#!/usr/bin/env node

/**
 * Diagnostic Test Script for SagradaGo Backend API
 * This script tests the API configuration and connectivity issues
 */

const https = require('https');
const http = require('http');

console.log('🔍 SagradaGo Backend API Diagnostic Test');
console.log('=' .repeat(60));

// API endpoints to test
const endpoints = [
  {
    name: 'Render Backend (render.yaml config)',
    url: 'https://sagradago-backend.onrender.com/api/health',
    expected: 'Should be the correct backend URL'
  },
  {
    name: 'Frontend API (.env.production config)',
    url: 'https://sagradago.onrender.com/api/health',
    expected: 'May be incorrect - points to frontend service'
  },
  {
    name: 'Development API (.env config)',
    url: 'http://sagradago.onrender.com/api/health',
    expected: 'HTTP instead of HTTPS - will fail in production'
  }
];

async function testEndpoint(endpoint) {
  console.log(`\n🧪 Testing: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.url}`);
  console.log(`   Expected: ${endpoint.expected}`);
  
  const protocol = endpoint.url.startsWith('https:') ? https : http;
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = protocol.get(endpoint.url, {
      headers: {
        'User-Agent': 'SagradaGo-Diagnostic/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   ✅ Status: ${res.statusCode}`);
        console.log(`   ⏱️  Response Time: ${responseTime}ms`);
        console.log(`   📋 Headers:`, JSON.stringify(res.headers, null, 4));
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`   📄 Response Body:`, JSON.stringify(jsonData, null, 4));
          
          if (jsonData.diagnostics) {
            console.log(`   🔧 Diagnostics Available: ✅`);
          }
        } catch (e) {
          console.log(`   📄 Response Body (raw):`, data.substring(0, 200) + '...');
        }
        
        resolve({ success: true, statusCode: res.statusCode, responseTime, data });
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   ⏱️  Time to error: ${responseTime}ms`);
      console.log(`   🔍 Error Code: ${error.code}`);
      
      if (error.code === 'ENOTFOUND') {
        console.log(`   💡 Diagnosis: DNS resolution failed - URL may not exist`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   💡 Diagnosis: Connection refused - service may be down`);
      } else if (error.code === 'TIMEOUT') {
        console.log(`   💡 Diagnosis: Request timeout - service may be overloaded`);
      }
      
      resolve({ success: false, error: error.message, errorCode: error.code, responseTime });
    });
    
    req.on('timeout', () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      console.log(`   ⏱️  Timeout after ${responseTime}ms`);
      resolve({ success: false, error: 'Request timeout', responseTime });
    });
  });
}

async function runDiagnostics() {
  console.log('🚀 Starting API endpoint tests...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push({ endpoint: endpoint.name, ...result });
    
    // Add delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.endpoint}`);
    if (result.success) {
      console.log(`   Status: ✅ Success (${result.statusCode})`);
      console.log(`   Response Time: ${result.responseTime}ms`);
    } else {
      console.log(`   Status: ❌ Failed`);
      console.log(`   Error: ${result.error}`);
      console.log(`   Response Time: ${result.responseTime}ms`);
    }
  });
  
  // Analysis
  console.log('\n' + '='.repeat(60));
  console.log('🔍 CONFIGURATION ANALYSIS');
  console.log('='.repeat(60));
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  if (successfulTests.length === 0) {
    console.log('❌ CRITICAL: All API endpoints failed to respond');
    console.log('💡 This indicates a severe deployment issue');
  } else if (failedTests.length > 0) {
    console.log('⚠️  WARNING: Some API endpoints are unreachable');
    console.log('💡 This indicates configuration mismatches');
  } else {
    console.log('✅ All API endpoints are responding');
  }
  
  console.log('\n📝 RECOMMENDATIONS:');
  if (results[0]?.success && !results[1]?.success) {
    console.log('1. ✅ Use sagradago-backend.onrender.com for API calls');
    console.log('2. ❌ Fix .env.production to point to backend service');
  }
  
  if (results[2] && results[2].error?.includes('ENOTFOUND')) {
    console.log('3. ❌ Fix .env to use HTTPS instead of HTTP');
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Update API URL configurations to use working endpoint');
  console.log('2. Verify environment variables in Render dashboard');
  console.log('3. Test chatbot functionality with corrected URLs');
}

// Run diagnostics
runDiagnostics().catch(console.error);