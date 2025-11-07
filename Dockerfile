FROM node:18-alpine
RUN apk add --no-cache tini
RUN npm install -g n8n
WORKDIR /data
RUN adduser -D n8n && chown -R n8n /data
USER n8n
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_BASIC_AUTH_USER=admin
ENV N8N_BASIC_AUTH_PASSWORD=admin123
ENV N8N_HOST=0.0.0.0
ENV N8N_PROTOCOL=https
ENV WEBHOOK_URL=https://hr-autotest.onrender.com
ENV N8N_EDITOR_BASE_URL=https://hr-autotest.onrender.com
ENV NODE_ENV=production
# Hardcoded port for Dockerfile EXPOSE, not dynamic.
EXPOSE 5678
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["n8n"]
