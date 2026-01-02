#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

VAULT_ADDR="http://127.0.0.1:8200" # Vault address on the host for setup script
VAULT_CONTAINER_NAME="diform-vault"
VAULT_CONFIG_DIR="./docker/vault"
VAULT_SECRETS_FILE="${VAULT_CONFIG_DIR}/vault-secrets.json" # File to store Vault unseal keys and root token
VAULT_APP_ROLE_ID_FILE="${VAULT_CONFIG_DIR}/vault-approle-id.json" # File to store AppRole ID and Secret ID

# Wait for Vault to be ready
echo "Waiting for Vault to be available at ${VAULT_ADDR}..."
until curl -s ${VAULT_ADDR}/v1/sys/health | grep '"initialized":true' > /dev/null; do
  echo "Vault not yet initialized, waiting..."
  sleep 2
done
echo "Vault is initialized."

# Check if Vault is sealed
VAULT_SEALED=$(curl -s ${VAULT_ADDR}/v1/sys/seal-status | jq -r .sealed)

if [ "$VAULT_SEALED" = "true" ]; then
  echo "Vault is sealed, attempting to unseal..."
  # Check if vault-secrets.json exists
  if [ ! -f "$VAULT_SECRETS_FILE" ]; then
    echo "Error: ${VAULT_SECRETS_FILE} not found. Cannot unseal Vault."
    echo "Please ensure Vault has been initialized and unseal keys are available."
    exit 1
  fi

  # Read unseal keys from vault-secrets.json
  UNSEAL_KEY1=$(jq -r '.unseal_keys_b64[0]' "$VAULT_SECRETS_FILE")
  UNSEAL_KEY2=$(jq -r '.unseal_keys_b64[1]' "$VAULT_SECRETS_FILE")
  UNSEAL_KEY3=$(jq -r '.unseal_keys_b64[2]' "$VAULT_SECRETS_FILE")

  echo "Unsealing Vault with Key 1..."
  curl -s --request PUT --data "{\"key\": \"${UNSEAL_KEY1}\"}" ${VAULT_ADDR}/v1/sys/unseal | jq .
echo "Unsealing Vault with Key 2..."
  curl -s --request PUT --data "{\"key\": \"${UNSEAL_KEY2}\"}" ${VAULT_ADDR}/v1/sys/unseal | jq .
echo "Unsealing Vault with Key 3..."
  curl -s --request PUT --data "{\"key\": \"${UNSEAL_KEY3}\"}" ${VAULT_ADDR}/v1/sys/unseal | jq .

  echo "Waiting for Vault to be unsealed..."
  until curl -s ${VAULT_ADDR}/v1/sys/seal-status | grep '"sealed":false' > /dev/null; do
    echo "Vault not yet unsealed, waiting..."
    sleep 2
  done
  echo "Vault is unsealed."
else
  echo "Vault is already unsealed."
fi

# Check if Vault is initialized
VAULT_INITIALIZED=$(curl -s ${VAULT_ADDR}/v1/sys/health | jq -r .initialized)

if [ "$VAULT_INITIALIZED" = "false" ]; then
  echo "Initializing Vault..."
  INIT_RESPONSE=$(curl -s --request PUT --data '{"secret_shares": 1, "secret_threshold": 1}' ${VAULT_ADDR}/v1/sys/init)
  echo "$INIT_RESPONSE" | jq . > "$VAULT_SECRETS_FILE"
  echo "Vault initialized. Root token and unseal keys saved to ${VAULT_SECRETS_FILE}"

  # Unseal Vault with the single key
  UNSEAL_KEY=$(jq -r '.unseal_keys_b64[0]' "$VAULT_SECRETS_FILE")
  echo "Unsealing Vault with the first key..."
  curl -s --request PUT --data "{\"key\": \"${UNSEAL_KEY}\"}" ${VAULT_ADDR}/v1/sys/unseal | jq .

  echo "Waiting for Vault to be unsealed after initialization..."
  until curl -s ${VAULT_ADDR}/v1/sys/seal-status | grep '"sealed":false' > /dev/null; do
    echo "Vault not yet unsealed, waiting..."
    sleep 2
  done
  echo "Vault is unsealed."

  VAULT_ROOT_TOKEN=$(jq -r '.root_token' "$VAULT_SECRETS_FILE")
  echo "Root Token: ${VAULT_ROOT_TOKEN}" # Display root token for convenience in dev
else
  echo "Vault is already initialized."
  if [ -f "$VAULT_SECRETS_FILE" ]; then
    VAULT_ROOT_TOKEN=$(jq -r '.root_token' "$VAULT_SECRETS_FILE")
  else
    echo "Warning: ${VAULT_SECRETS_FILE} not found. Cannot retrieve root token programmatically. Manual intervention might be needed."
    echo "Attempting to retrieve an active token for configuration steps (e.g., from environment or a known default if Vault is unsealed)."
    # Fallback for already initialized/unsealed Vault without secrets file (less secure, only for dev)
    VAULT_ROOT_TOKEN=${VAULT_DEV_ROOT_TOKEN_ID:-"root"} # Try a known dev token if set
    echo "Using fallback token: ${VAULT_ROOT_TOKEN}"
  fi
fi

if [ -z "$VAULT_ROOT_TOKEN" ]; then
  echo "Error: VAULT_ROOT_TOKEN is not available. Cannot configure Vault."
  exit 1
fi

echo "Vault is unsealed and ready. Proceeding with configuration..."

# Configure Vault using the root token
export VAULT_TOKEN=$VAULT_ROOT_TOKEN

# 1. Enable KV secrets engine v2 at 'secret/' path (if not already enabled)
echo "Enabling KV secrets engine v2 at 'secret/'..."
if ! vault secrets list | grep "secret/"; then
  vault secrets enable -path=secret kv-v2
fi
echo "KV secrets engine 'secret/' enabled."

# 2. Enable AppRole auth method (if not already enabled)
echo "Enabling AppRole auth method..."
if ! vault auth list | grep "approle/"; then
  vault auth enable approle
fi
echo "AppRole auth method enabled."

# 3. Create policy for the application
echo "Creating Vault policy 'diform-app-policy'..."
vault policy write diform-app-policy - <<EOF
path "secret/data/diform/*" {
  capabilities = ["read"]
}
path "auth/token/lookup-self" {
  capabilities = ["read"]
}
EOF
echo "Policy 'diform-app-policy' created."

# 4. Create AppRole for the application
echo "Creating AppRole 'diform-app-role'..."
vault write auth/approle/role/diform-app-role \
    token_ttl="1h" \
    token_max_ttl="24h" \
    secret_id_ttl="1h" \
    secret_id_num_uses="1" \
    policies="diform-app-policy" \
    bind_secret_id="true" \
    token_type="service" \
    period="24h" # Token can be renewed for up to 24h

# Get Role ID
ROLE_ID=$(vault read -field=role_id auth/approle/role/diform-app-role/role-id)
echo "AppRole 'diform-app-role' created with Role ID: ${ROLE_ID}"

# Generate Secret ID
SECRET_ID_RESPONSE=$(vault write -f auth/approle/role/diform-app-role/secret-id)
SECRET_ID=$(echo "$SECRET_ID_RESPONSE" | grep "secret_id " | awk '{print $NF}') # Extract secret_id from output
echo "AppRole Secret ID generated: ${SECRET_ID}"

# Save AppRole ID and Secret ID to a file for the application to use
echo "{\"VAULT_ROLE_ID\": \"${ROLE_ID}\", \"VAULT_SECRET_ID\": \"${SECRET_ID}\"}" | jq . > "$VAULT_APP_ROLE_ID_FILE"
echo "AppRole ID and Secret ID saved to ${VAULT_APP_ROLE_ID_FILE}"

# 5. Write initial secrets (JWT_SECRET, MONGODB_URI, ENCRYPTION_KEY)
echo "Writing initial secrets to 'secret/diform/config'..."
ENCRYPTION_KEY_HEX=$(openssl rand -hex 32) # Generate a random 32-byte (256-bit) hex key
vault kv put secret/diform/config \
  jwt_secret="a-very-long-and-complex-jwt-secret-key-for-diform-production-readiness" \
  mongodb_uri="mongodb://mongodb:27017/diform" \
  redis_url="redis://redis:6379" \
  encryption_key="${ENCRYPTION_KEY_HEX}"
echo "Initial secrets written."

echo "Vault setup completed successfully."
# Unset VAULT_TOKEN for security
unset VAULT_TOKEN
