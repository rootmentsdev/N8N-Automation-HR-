# Use the official n8n Docker image
FROM n8nio/n8n:latest

# Set environment variables
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_BASIC_AUTH_USER=admin
ENV N8N_BASIC_AUTH_PASSWORD=admin123
ENV N8N_PORT=5678
ENV WEBHOOK_URL=https://hr-autotest.onrender.com

# Expose the port Render uses
EXPOSE 5678

# Use tini as entrypoint and run n8n
ENTRYPOINT ["tini", "--"]
CMD ["n8n"]
