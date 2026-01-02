#!/bin/bash
set -e

# Define certificate paths
CERT_DIR="./docker/nginx/ssl"
DOMAIN="localhost" # Use localhost for self-signed cert, replace with your domain if needed

FULLCHAIN_PATH="${CERT_DIR}/live/${DOMAIN}/fullchain.pem"
PRIVKEY_PATH="${CERT_DIR}/live/${DOMAIN}/privkey.pem"
CHAIN_PATH="${CERT_DIR}/live/${DOMAIN}/chain.pem" # Usually fullchain.pem without the root
DHPARAM_PATH="${CERT_DIR}/dhparam.pem"

echo "Checking for existing SSL certificates for ${DOMAIN}..."

# Create directory structure if it doesn't exist
mkdir -p "${CERT_DIR}/live/${DOMAIN}"

# Generate self-signed certificate if not present
if [ ! -f "${FULLCHAIN_PATH}" ] || [ ! -f "${PRIVKEY_PATH}" ]; then
  echo "Generating self-signed SSL certificates for ${DOMAIN}..."
  openssl req -x509 -nodes -newkey rsa:2048 -days 365 -keyout "${PRIVKEY_PATH}" -out "${FULLCHAIN_PATH}" -subj "/CN=${DOMAIN}"
  # For self-signed, fullchain is usually the only cert, chain is often empty or fullchain itself
  cp "${FULLCHAIN_PATH}" "${CHAIN_PATH}"
  echo "Self-signed certificates generated."
else
  echo "Existing self-signed certificates found."
fi

# Generate strong Diffie-Hellman parameters if not present
if [ ! -f "${DHPARAM_PATH}" ]; then
  echo "Generating Diffie-Hellman parameters (this may take a while)..."
  openssl dhparam -out "${DHPARAM_PATH}" 2048
  echo "Diffie-Hellman parameters generated."
else
  echo "Existing Diffie-Hellman parameters found."
fi

echo "SSL setup complete for local development."
