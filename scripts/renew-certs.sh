#!/bin/bash
set -e

# Define container names
NGINX_CONTAINER="diform-nginx" # The name of your Nginx container
CERTBOT_CONTAINER="diform-certbot" # The name of your Certbot container

echo "Attempting to renew Let's Encrypt certificates..."

# Run certbot renew
# --force-renewal is for testing, remove in production
# --nginx is to use the Nginx authenticator
# --agree-tos and --email are typically set during initial setup
if docker exec "$CERTBOT_CONTAINER" certbot renew --quiet --noninteractive; then
  echo "Certificates renewed successfully."
  echo "Reloading Nginx to apply new certificates..."
  if docker exec "$NGINX_CONTAINER" nginx -s reload; then
    echo "Nginx reloaded successfully."
  else
    echo "Error: Failed to reload Nginx."
    exit 1
  fi
else
  echo "No certificates were renewed or an error occurred during renewal."
  exit 0 # Exit with 0 even if no certificates were renewed, as it's not an error condition for cron
fi

echo "Certificate renewal script finished."
