#!/bin/bash
set -e

KEYFILE_PATH="./docker/mongodb/keyfile"

echo "Generating MongoDB encryption keyfile..."
# Generate a 1024-byte random key
openssl rand -base64 768 > "${KEYFILE_PATH}"

# Ensure proper permissions (read-only for owner)
chmod 600 "${KEYFILE_PATH}"

echo "MongoDB keyfile generated at ${KEYFILE_PATH}"
echo "Permissions set to 600"
