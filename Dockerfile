# Use official Node.js image
FROM node:18-alpine

# Install tini
RUN apk add --no-cache tini

# Install n8n
RUN npm install -g n8n

# Set working directory
WORKDIR /data

# Environment variables
ENV N8N_PORT=${PORT}
ENV N8N_HOST=0.0.0.0
ENV N8N_PROTOCOL=https
ENV WEBHOOK_URL=https://hr-autotest.onrender.com
ENV N8N_EDITOR_BASE_URL=https://hr-autotest.onrender.com
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_BASIC_AUTH_USER=admin
ENV N8N_BASIC_AUTH_PASSWORD=admin123

# Expose Render port
EXPOSE ${PORT}

# Start n8n
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["n8n", "start"]
