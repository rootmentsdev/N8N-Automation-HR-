# ---- Base image ----
    FROM node:18-alpine

    # ---- Install tini (for process management) ----
    RUN apk add --no-cache tini
    
    # ---- Install n8n globally ----
    RUN npm install -g n8n
    
    # ---- Create and set working directory ----
    WORKDIR /home/node/.n8n
    RUN chown -R node:node /home/node/.n8n
    USER node
    
    # ---- Environment variables ----
    ENV N8N_BASIC_AUTH_ACTIVE=true
    ENV N8N_BASIC_AUTH_USER=admin
    ENV N8N_BASIC_AUTH_PASSWORD=admin123
    ENV N8N_PORT=${PORT}
    ENV N8N_HOST=0.0.0.0
    ENV N8N_PROTOCOL=https
    ENV WEBHOOK_URL=https://hr-autotest.onrender.com
    ENV N8N_EDITOR_BASE_URL=https://hr-autotest.onrender.com
    ENV NODE_ENV=production
    
    # ---- Expose dynamic port for Render ----
    EXPOSE ${PORT}
    
    # ---- Start n8n ----
    ENTRYPOINT ["/sbin/tini", "--"]
    CMD ["n8n"]
    