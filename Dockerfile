# Use official n8n image
FROM n8nio/n8n:latest

# Set environment variables
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_BASIC_AUTH_USER=admin
ENV N8N_BASIC_AUTH_PASSWORD=admin123
ENV N8N_PORT=5678
ENV WEBHOOK_URL=https://hr-autotest.onrender.com

# Expose port for Render
EXPOSE 5678

# Start n8n correctly using tini (official entrypoint)
CMD ["tini", "--", "n8n"]
