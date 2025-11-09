process.env.N8N_BASIC_AUTH_ACTIVE = 'true';
process.env.N8N_BASIC_AUTH_USER = 'admin';
process.env.N8N_BASIC_AUTH_PASSWORD = 'admin123';
process.env.N8N_HOST = '0.0.0.0';
process.env.N8N_PORT = process.env.PORT || 5678;
process.env.N8N_PROTOCOL = 'https';
process.env.WEBHOOK_URL = 'https://hr-autotest.onrender.com';
process.env.N8N_EDITOR_BASE_URL = 'https://hr-autotest.onrender.com';
process.env.NODE_ENV = 'production';

require('n8n');
