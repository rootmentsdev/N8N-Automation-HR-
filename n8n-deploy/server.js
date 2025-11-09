import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Configure n8n for Render deployment
const PORT = process.env.PORT || 5678;
const N8N_INTERNAL_PORT = 5679; // Internal port for n8n

// Set n8n to use internal port
process.env.N8N_PORT = N8N_INTERNAL_PORT.toString();
process.env.N8N_HOST = '0.0.0.0';

// Configure n8n base URL if needed
if (process.env.RENDER_EXTERNAL_URL) {
  const url = new URL(process.env.RENDER_EXTERNAL_URL);
  process.env.N8N_HOST = url.hostname;
  process.env.N8N_PROTOCOL = url.protocol.replace(':', '');
}

const app = express();

// Root route handler to fix 404 error
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'HR Notification Service is running',
    service: 'n8n',
    version: '1.43.1',
    endpoints: {
      root: '/',
      health: '/health',
      n8n: '/'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'hr-notification',
    timestamp: new Date().toISOString()
  });
});

// Start n8n in the background
import('n8n/bin/n8n').then(() => {
  console.log('n8n started on internal port', N8N_INTERNAL_PORT);
}).catch((error) => {
  console.error('Error starting n8n:', error);
});

// Wait a bit for n8n to start, then proxy all other requests to n8n
setTimeout(() => {
  // Proxy all requests to n8n (except root and health which are handled above)
  // Express matches specific routes before middleware, so our app.get() routes will work
  app.use(createProxyMiddleware({
    target: `http://localhost:${N8N_INTERNAL_PORT}`,
    changeOrigin: true,
    ws: true, // Enable websocket proxying for n8n
    logLevel: 'info',
    filter: (pathname, req) => {
      // Don't proxy root and health endpoints (handled by explicit routes above)
      // Express matches specific routes before middleware, but this ensures we don't proxy these
      return pathname !== '/' && pathname !== '/health';
    },
    onError: (err, req, res) => {
      // If n8n isn't ready yet, return a helpful message
      if (err.code === 'ECONNREFUSED') {
        res.status(503).json({
          status: 'error',
          message: 'n8n is starting up, please wait a moment and try again'
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Proxy error',
          error: err.message
        });
      }
    }
  }));
}, 2000); // Wait 2 seconds for n8n to start

// Start Express server on Render's PORT
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Root endpoint available at http://localhost:${PORT}/`);
  console.log(`n8n will be available at http://localhost:${PORT}/`);
});
