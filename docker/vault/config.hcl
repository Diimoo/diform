# config.hcl

# Storage configuration
storage "mongodb" {
  uri = "mongodb://mongodb:27017/vault" # Connect to MongoDB service defined in docker-compose.yml
  # HA configuration (optional for a single node, but good practice for future expansion)
  # ha_enabled = "true" 
}

# Listener configuration
listener "tcp" {
  address     = "0.0.0.0:8200" # Listen on all interfaces on port 8200
  tls_disable = "true"         # Disable TLS for local development/docker-compose.
                               # In production, this should be 'false' and proper TLS certs configured.
}

# UI configuration (optional, enable if you want to use the Vault UI)
ui = true

# Telemetry configuration (optional)
# telemetry {
#   statsd_address = "localhost:8125"
#   disable_hostname = true
# }
