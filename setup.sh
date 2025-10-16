#!/bin/bash

# DIForM Setup Script
# This script helps set up the development environment

set -e

echo "=========================================="
echo "DIForM Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Check if MongoDB is running
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. You'll need to start it manually or use Docker."
    fi
else
    echo "⚠️  MongoDB client not found. Install MongoDB or use Docker."
fi

echo ""
echo "Installing dependencies..."
echo ""

# Install root dependencies
echo "📦 Installing server dependencies..."
npm install

# Install client dependencies
if [ -d "client" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Install electron dependencies
if [ -d "electron" ]; then
    echo "📦 Installing electron dependencies..."
    cd electron && npm install && cd ..
fi

echo ""
echo "Creating .env file from .env.example..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and set the following:"
    echo "   - MONGODB_URI (default: mongodb://localhost:27017/diform)"
    echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "   - AZURE_CLIENT_ID (for Electron app, if using Microsoft Graph)"
    echo ""
else
    echo "⚠️  .env file already exists, skipping..."
fi

# Create logs directory
mkdir -p logs
echo "✅ Created logs directory"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env file with your configuration:"
echo "   nano .env"
echo ""
echo "2. Generate JWT secret (if not set):"
echo "   openssl rand -base64 32"
echo ""
echo "3. Start MongoDB (if not running):"
echo "   docker-compose up mongodb"
echo "   OR"
echo "   mongod --dbpath=/path/to/data"
echo ""
echo "4. Start the application:"
echo "   npm run dev"
echo ""
echo "5. Run tests:"
echo "   npm test"
echo ""
echo "For more information, see README.md and CRITICAL_ISSUES_FIXED.md"
echo ""
