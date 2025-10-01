# DIForM - Local AI Setup Guide

## 🤖 Two AI Systems Included

### Desktop/Backend: **Ollama** (Powerful)
- ✅ Llama 3, Mistral, CodeLlama, etc.
- ✅ Runs completely offline
- ✅ Full reasoning capabilities
- ✅ No API costs ever

### Web/Browser: **Transformers.js** (Lightweight)
- ✅ Runs in browser
- ✅ No backend needed
- ✅ Instant startup
- ✅ Perfect for web app

---

## 🚀 Quick Start - Ollama (Desktop/Backend)

### Step 1: Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [ollama.com/download](https://ollama.com/download)

### Step 2: Pull a Model

```bash
# Recommended: Llama 3.2 (3B) - Fast & capable
ollama pull llama3.2

# Or larger for better quality:
ollama pull llama3.2:latest  # 7B model
```

**Available Models:**
- `llama3.2` - Best balance (3B)
- `llama3.2:latest` - More capable (7B)
- `mistral` - Alternative (7B)
- `phi3` - Smallest (3.8B)

### Step 3: Start Ollama

```bash
ollama serve
```

Runs on `http://localhost:11434`

### Step 4: Configure DIForM

Edit `.env`:
```bash
OLLAMA_MODEL=llama3.2
OLLAMA_HOST=http://localhost:11434
```

### Step 5: Test It!

```bash
# Install new dependencies
npm install

# Start backend with AI
PORT=5001 npm run server
```

**Try a command:**
```
"Summarize my emails from last week and schedule follow-ups"
```

Now uses **real AI** to understand and plan!

---

## 🌐 Transformers.js (Web/Browser)

### Already Included!

The web app now uses Transformers.js automatically:

```bash
cd client
npm install
npm start
```

**First run:**
- Downloads ~100MB model (once)
- Caches in browser
- Works offline after download

**Features:**
- ✅ Text classification
- ✅ Sentiment analysis
- ✅ Command understanding
- ✅ No server needed

---

## 🎯 How It Works

### Desktop App Flow

```
User Command
    ↓
Backend API
    ↓
Ollama (Local LLM)
    ↓
Real AI Analysis
    ↓
Action Plan
    ↓
Execute via Microsoft Graph
```

### Web App Flow

```
User Command
    ↓
Browser
    ↓
Transformers.js (In-browser AI)
    ↓
Quick Analysis
    ↓
Action Suggestions
    ↓
Backend API (optional)
```

---

## 💪 Model Comparison

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| phi3 | 3.8GB | ⚡⚡⚡ | ⭐⭐ | Fast responses |
| llama3.2 (3B) | 3GB | ⚡⚡⚡ | ⭐⭐⭐ | **Recommended** |
| llama3.2 (7B) | 7GB | ⚡⚡ | ⭐⭐⭐⭐ | Better quality |
| mistral | 7GB | ⚡⚡ | ⭐⭐⭐⭐ | Alternative |
| llama3 (70B) | 40GB | ⚡ | ⭐⭐⭐⭐⭐ | Best (needs GPU) |

### System Requirements

**Minimum:**
- 8GB RAM
- 10GB disk space
- Modern CPU

**Recommended:**
- 16GB RAM
- 20GB disk space
- GPU (optional, 10x faster)

---

## 🔧 Configuration Options

### Backend (.env)

```bash
# Ollama Configuration
OLLAMA_MODEL=llama3.2
OLLAMA_HOST=http://localhost:11434
OLLAMA_TIMEOUT=30000

# Fallback to keywords if Ollama unavailable
AI_FALLBACK=true
```

### Customize Prompts

Edit `server/services/aiService.js`:

```javascript
buildPrompt(command, context) {
  return `You are DIForM...
Custom instructions here...`;
}
```

---

## 🧪 Testing

### Test Ollama Directly

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Summarize: Q3 sales up 25%"
}'
```

### Test via DIForM API

```bash
curl -X POST http://localhost:5001/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "command": "Analyze my emails and schedule meetings"
  }'
```

---

## 🎨 Advanced Usage

### GPU Acceleration

**NVIDIA GPU:**
```bash
# Ollama automatically uses GPU if available
nvidia-smi  # Check GPU
ollama run llama3.2  # Will use GPU
```

### Custom Models

```bash
# Fine-tune your own model
ollama create my-custom-model -f Modelfile
ollama run my-custom-model
```

### Multiple Models

```javascript
// Switch models per task
const models = {
  email: 'llama3.2',
  code: 'codellama',
  analysis: 'mistral'
};
```

---

## 📊 Performance Tips

### Faster Responses

1. **Use smaller models**: phi3 or llama3.2 (3B)
2. **Reduce context**: Shorter prompts
3. **Enable GPU**: 10x speed boost
4. **Increase RAM**: More for caching

### Better Quality

1. **Use larger models**: llama3.2 (7B) or mistral
2. **Better prompts**: More specific instructions
3. **Add examples**: Few-shot learning
4. **Fine-tune**: Train on your data

---

## 🔒 Privacy Benefits

### 100% Local Processing
- ✅ No data sent to cloud
- ✅ No API keys needed
- ✅ No usage limits
- ✅ Works offline
- ✅ GDPR compliant
- ✅ Zero cost

### vs External APIs (OpenAI, etc.)
| Feature | Local (Ollama) | Cloud API |
|---------|---------------|-----------|
| Privacy | ✅ Complete | ❌ Data sent |
| Cost | ✅ Free | 💰 Pay per use |
| Speed | ⚡ Instant | 🌐 Network delay |
| Offline | ✅ Works | ❌ Requires internet |
| Limits | ✅ None | ⚠️ Rate limits |

---

## 🐛 Troubleshooting

### Ollama won't start
```bash
# Check if running
curl http://localhost:11434

# Restart
killall ollama
ollama serve
```

### Model download fails
```bash
# Try different mirror
ollama pull llama3.2 --insecure
```

### Out of memory
```bash
# Use smaller model
ollama pull phi3

# Or reduce concurrent requests
```

### Slow responses
```bash
# Check GPU usage
nvidia-smi

# Use quantized models
ollama pull llama3.2:q4_0  # 4-bit quantized
```

---

## 🎯 What You Get

### With Ollama Running:
- ✅ **Real AI understanding** of commands
- ✅ **Smart action planning** based on context
- ✅ **Natural language** processing
- ✅ **Context awareness** across tasks
- ✅ **Learning** from patterns

### With Transformers.js:
- ✅ **Instant** browser-based AI
- ✅ **No setup** required
- ✅ **Offline** after first load
- ✅ **Privacy** preserved
- ✅ **Fast** classification

---

## 🚀 Next Steps

1. ✅ Install Ollama
2. ✅ Pull llama3.2 model
3. ✅ Start Ollama server
4. ✅ Run DIForM backend
5. ✅ Test with real commands
6. ✅ Try different models
7. ✅ Fine-tune for your needs

---

**Both AI systems are now integrated and ready to use!** 🎉

*Local AI. Zero API costs. Complete privacy.* 🔒
