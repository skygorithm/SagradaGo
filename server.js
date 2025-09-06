// FRONTEND SERVER (server.js)
// This server serves the React frontend and proxies API requests to the backend server in development.

const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

 // ALWAYS proxy API requests in ALL environments
const API_TARGET = process.env.API_TARGET || 'http://localhost:5001';

app.use('/api', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('API service unavailable');
  }
}));

// Handle client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).send('API route not found');
  }
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`\n🚀 Frontend server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API requests proxied to ${API_TARGET}`);
  console.log(`Serving static files from: ${path.join(__dirname, '../build')}`);
});