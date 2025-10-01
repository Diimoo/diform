#!/bin/bash

echo "🤖 Installing Ollama for DIForM..."
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Detected macOS"
    curl -fsSL https://ollama.com/install.sh | sh
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Detected Linux"
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "💻 Please download Ollama manually from https://ollama.com/download"
    exit 1
fi

echo ""
echo "✅ Ollama installed!"
echo ""
echo "🔽 Pulling recommended model (llama3.2)..."
ollama pull llama3.2

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start Ollama:"
echo "  ollama serve"
echo ""
echo "Then start DIForM:"
echo "  PORT=5001 npm run server"
echo ""
