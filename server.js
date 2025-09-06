// FRONTEND SERVER (server.js)
// This server serves the React frontend and proxies API requests to the backend server in development.
const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware').createProxyMiddleware;
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Proxy API requests to backend server in development
if (process.env.NODE_ENV === 'development') {
  app.use('/api', proxy({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: {
      '^/api': ''
    }
  }));
}

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`\n🚀 Frontend server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'development') {
    console.log('API requests proxied to http://localhost:5001');
  }
});