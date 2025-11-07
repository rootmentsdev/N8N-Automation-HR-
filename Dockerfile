# Use the official n8n image
FROM n8nio/n8n:latest

# Set environment variables
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_BASIC_AUTH_USER=admin
ENV N8N_BASIC_AUTH_PASSWORD=admin123
ENV N8N_PORT=5678
ENV WEBHOOK_URL=https://hr-autotest.onrender.com
ENV N8N_HOST=0.0.0.0
ENV N8N_PROTOCOL=https

# Expose the port
EXPOSE 5678

# Start n8n
ENTRYPOINT ["tini", "--"]
CMD ["n8n"]
