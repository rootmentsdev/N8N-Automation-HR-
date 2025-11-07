# Use Node.js 18 Alpine base image
FROM node:18-alpine

# Install tini for process management
RUN apk add --no-cache tini

# Install n8n globally
RUN npm install -g n8n

# Create working directory for n8n
WORKDIR /data
RUN mkdir -p /home/node/.n8n && chown -R node:node /home/node/.n8n

USER node

# Set environment variables
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_BASIC_AUTH_USER=admin
ENV N8N_BASIC_AUTH_PASSWORD=admin123
ENV N8N_PORT=${PORT}
ENV N8N_HOST=0.0.0.0
ENV N8N_PROTOCOL=https
ENV WEBHOOK_URL=https://hr-autotest.onrender.com
ENV N8N_EDITOR_BASE_URL=https://hr-autotest.onrender.com
ENV NODE_ENV=production

# Expose the Render dynamic port
EXPOSE ${PORT}

# Run n8n with tini as the init process
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["n8n"]