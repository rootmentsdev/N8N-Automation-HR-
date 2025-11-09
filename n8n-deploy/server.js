// IMPORTANT: Set all n8n environment variables BEFORE any imports
// Configure n8n for Render deployment
const PORT = process.env.PORT || 5678;
const N8N_INTERNAL_PORT = parseInt(PORT) + 1; // Use PORT + 1 to avoid conflicts

// Set n8n to use internal port BEFORE any imports
// IMPORTANT: n8n must use a DIFFERENT port than our Express server
// Save the original PORT for our Express server
const EXPRESS_PORT = PORT;
// Configure n8n to use a different port
process.env.N8N_PORT = N8N_INTERNAL_PORT.toString();
process.env.N8N_HOST = '0.0.0.0';
// Make sure n8n doesn't read the main PORT env var
// (n8n should only use N8N_PORT)

// Disable queue mode - run in main process mode to avoid Task Broker entirely
// This is the simplest solution for single-instance deployments
process.env.EXECUTIONS_PROCESS = 'main';
process.env.N8N_QUEUE_BULL_REDIS_HOST = '';

// Disable Task Broker completely for single-instance deployment
// Disable runners to prevent Task Broker from starting
process.env.N8N_RUNNERS_ENABLED = 'false';
// Set Task Broker port to a high number to avoid conflicts (even if disabled)
process.env.N8N_RUNNERS_BROKER_PORT = '56800';
// Also set the task broker URI to prevent it from trying to bind
process.env.N8N_RUNNERS_TASK_BROKER_URI = '';

// Now import after environment is configured
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Configure n8n base URL if needed
if (process.env.RENDER_EXTERNAL_URL) {
  const url = new URL(process.env.RENDER_EXTERNAL_URL);
  process.env.N8N_HOST = url.hostname;
  process.env.N8N_PROTOCOL = url.protocol.replace(':', '');
}

const app = express();

// Root route handler to fix 404 error - MUST be registered before proxy
app.get('/', (req, res) => {
  console.log('Root route hit!'); // Debug log
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
  console.log('Health route hit!'); // Debug log
  res.json({ 
    status: 'healthy',
    service: 'hr-notification',
    timestamp: new Date().toISOString()
  });
});

// Start Express server on Render's PORT FIRST
// This MUST start and bind to the port before n8n starts
app.listen(EXPRESS_PORT, '0.0.0.0', () => {
  console.log(`Express server is running on port ${EXPRESS_PORT}`);
  console.log(`Root endpoint available at http://localhost:${EXPRESS_PORT}/`);
  console.log(`Health endpoint available at http://localhost:${EXPRESS_PORT}/health`);
  console.log(`n8n will be proxied from http://localhost:${EXPRESS_PORT}/`);
  console.log(`n8n internal port: ${N8N_INTERNAL_PORT}`);
  
  // Now that Express server is bound to the port, start n8n
  console.log('Starting n8n...');
  import('n8n/bin/n8n').then(() => {
    console.log('n8n started on internal port', N8N_INTERNAL_PORT);
    
    // Wait a bit for n8n to fully initialize, then set up proxy
    setTimeout(() => {
      // Create proxy middleware that explicitly excludes root and health
      const proxy = createProxyMiddleware({
        target: `http://localhost:${N8N_INTERNAL_PORT}`,
        changeOrigin: true,
        ws: true, // Enable websocket proxying for n8n
        logLevel: 'info',
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
      });

      // Use middleware that checks the path before proxying
      app.use((req, res, next) => {
        // Explicitly skip proxy for root and health endpoints
        if (req.path === '/' || req.path === '/health') {
          return next(); // Let Express route handlers above handle these
        }
        // Proxy all other requests to n8n
        proxy(req, res, next);
      });
      
      console.log('Proxy middleware configured');
    }, 3000); // Wait 3 seconds for n8n to fully start
  }).catch((error) => {
    console.error('Error starting n8n:', error);
  });
});
