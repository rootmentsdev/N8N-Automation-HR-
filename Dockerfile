# Use the official n8n Docker image
FROM n8nio/n8n:latest

# Use Render's PORT dynamically
ENV N8N_PORT=${PORT}
ENV N8N_HOST=0.0.0.0
ENV N8N_PROTOCOL=https

# Authentication
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_BASIC_AUTH_USER=admin
ENV N8N_BASIC_AUTH_PASSWORD=admin123

# Your public Render URL (change this to your own service URL)
ENV WEBHOOK_URL=https://testhr-n8n.onrender.com

# Expose the Render port
EXPOSE ${PORT}

# Start n8n
ENTRYPOINT ["tini", "--"]
CMD ["n8n"]
