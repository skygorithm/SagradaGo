# SagradaGo Deployment Troubleshooting Guide

## 🚨 Current Issue: Website Taking Too Long to Respond

### Root Cause Analysis
- **Issue**: Production APIs timing out (both backend services unresponsive)
- **Status**: Local development works perfectly, production deployment has issues
- **Impact**: Website loads very slowly or fails to load

## 🔧 Fixes Applied

### 1. API URL Configuration Fixed
- **Problem**: Mismatch between `render.yaml` and `.env.production`
- **Solution**: Updated `.env.production` to use correct backend URL
- **Change**: `REACT_APP_API_URL=https://sagradago-backend.onrender.com`

### 2. Production Logging Optimized
- **Problem**: Excessive logging slowing down production performance
- **Solution**: Reduced logging verbosity in production environment
- **Impact**: Faster response times, reduced server load

### 3. Startup Optimization
- **Problem**: API tests on startup causing delays
- **Solution**: Skip API tests in production for faster deployment
- **Impact**: Faster server startup times

## 🔍 Render Deployment Investigation Steps

### Step 1: Check Render Service Status
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Check both services:
   - `sagradago-backend` (backend API)
   - `sagradago-frontend` (frontend app)
3. Verify both services show "Live" status
4. Check deployment logs for errors

### Step 2: Test Backend API Directly
```bash
# Test the correct backend URL
curl -I https://sagradago-backend.onrender.com/api/health

# Should respond with HTTP 200 in <2 seconds
```

### Step 3: Check Environment Variables
In Render dashboard, verify these environment variables are set:
- `GEMINI_API_KEY` ✅
- `REACT_APP_SUPABASE_URL` ✅
- `REACT_SUPABASE_SERVICE_ROLE_KEY` ✅
- `NODE_ENV=production` ✅
- `PORT=5001` ✅

### Step 4: Review Build/Deploy Logs
1. Check build logs for compilation errors
2. Check deploy logs for runtime errors
3. Look for memory/timeout issues
4. Check for missing dependencies

### Step 5: Test Frontend Deployment
```bash
# Test if frontend loads
curl -I https://sagradago.online

# Should respond quickly with HTML content
```

## 🚀 Quick Recovery Steps

### If Backend Service is Down:
1. **Redeploy Backend**: Trigger manual deploy in Render
2. **Check Logs**: Look for startup errors
3. **Verify Environment**: Ensure all env vars are set
4. **Test API**: Use health endpoint to verify functionality

### If Frontend Service is Down:
1. **Redeploy Frontend**: Trigger manual deploy in Render
2. **Check Build**: Ensure build process completes successfully
3. **Verify API URL**: Confirm frontend can reach backend
4. **Test Loading**: Check if static files load properly

### If Services are Live but Slow:
1. **Check Memory Usage**: Look for memory leaks in logs
2. **Review API Calls**: Check for slow database queries
3. **Monitor Response Times**: Use health endpoint for metrics
4. **Scale Resources**: Consider upgrading Render plan if needed

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```
GET https://sagradago-backend.onrender.com/api/health
```

Response should include:
```json
{
  "status": "ok",
  "apiKeyConfigured": true,
  "supabaseUrlConfigured": true,
  "supabaseServiceKeyConfigured": true,
  "apiTestSuccessful": true,
  "environment": "production"
}
```

### Performance Benchmarks
- **Health Check**: < 1 second response time
- **API Requests**: < 3 seconds for most operations
- **Page Load**: < 5 seconds initial load
- **Server Startup**: < 30 seconds cold start

## 🆘 Emergency Contacts

If issues persist:
1. Check Render status page for outages
2. Review Supabase dashboard for database issues
3. Check Gemini API status
4. Consider rolling back to previous deployment

## 📝 Next Steps

1. **Immediate**: Follow investigation steps above
2. **Short-term**: Implement proper monitoring/logging
3. **Long-term**: Set up automated health checks and alerts

---

*This guide was generated after diagnosing performance issues with sagradago.online on 2025-08-28*