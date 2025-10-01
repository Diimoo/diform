# DIForM - Quick Start Guide

## 🎉 Your Application is Running!

The DIForM application has been successfully built and is now running on your system.

### 📍 Access Points

- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:5001/api

### 🚀 What's Running

1. **Express Backend Server** (Port 5001)
   - RESTful API for processing DIForM commands
   - Real-time task execution simulation
   - Execution history tracking

2. **React Frontend** (Port 3000)
   - Modern, responsive UI
   - Interactive demo features
   - Smooth animations with Framer Motion

### 🎯 Try the Interactive Demo

1. Open http://localhost:3000 in your browser
2. Click the **"Try Interactive Demo"** button in the hero section
3. Select an example command or write your own
4. Watch DIForM process your request through 4 phases:
   - 🧠 **Understand**: Analyzes context
   - 📋 **Plan**: Creates execution steps
   - ⚡ **Execute**: Performs actions
   - ✅ **Verify**: Validates results

### 📝 Example Commands to Try

```
Summarize the last 48h customer emails for Project X, draft responses, 
schedule 2 meetings next week, and update the steering deck.
```

```
Create a QBR presentation from this Excel data with risks, opportunities 
and 3 recommendations - max 10 slides.
```

```
Prepare onboarding checklist, assign tasks in Planner, and invite 
everyone to the kick-off meeting.
```

```
Explain the Q3 variances, create pivot table, generate chart, and 
provide recommendations.
```

### 🔧 Development Commands

**Stop the servers:**
- Press `Ctrl+C` in the terminal where servers are running

**Restart the application:**
```bash
# Terminal 1: Start backend
PORT=5001 npm run server

# Terminal 2: Start frontend
cd client && npm start
```

**Run both concurrently:**
```bash
npm run dev
```

### 📂 Key Files

- **Backend API**: `server/index.js`
- **React App**: `client/src/App.js`
- **Components**: `client/src/components/`
- **Styles**: Individual `.css` files per component

### 🎨 UI Features

- ✨ **Smooth Animations**: Powered by Framer Motion
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎯 **Interactive Elements**: Hover effects and transitions
- 🔄 **Real-time Processing**: Live task execution visualization

### 🛠️ Customization

**Change Colors:**
Edit the color variables in component CSS files:
- Primary: `#3B82F6` (Blue)
- Secondary: `#10B981` (Green)

**Add New Features:**
1. Create component in `client/src/components/`
2. Import and use in `App.js`
3. Add routes in `server/index.js` if backend needed

**Modify API Behavior:**
Edit `server/index.js` to change:
- Processing logic
- Action identification
- Response format

### 📊 API Testing

**Test the health endpoint:**
```bash
curl http://localhost:5001/api/health
```

**Submit a command:**
```bash
curl -X POST http://localhost:5001/api/process \
  -H "Content-Type: application/json" \
  -d '{"command":"Summarize emails and schedule meeting"}'
```

**View history:**
```bash
curl http://localhost:5001/api/history
```

### 🐛 Troubleshooting

**Port Already in Use:**
- Change the PORT in commands: `PORT=5002 npm run server`

**React Not Loading:**
- Check if port 3000 is available
- Clear cache: `cd client && rm -rf node_modules/.cache`

**API Not Responding:**
- Verify backend is running on port 5001
- Check proxy setting in `client/package.json`

### 📚 Next Steps

1. ✅ Explore the interactive demo
2. ✅ Review the code structure
3. ✅ Customize the UI and features
4. ✅ Add real API integrations
5. ✅ Deploy to production

### 🎓 Learning Resources

- React Documentation: https://react.dev
- Express.js Guide: https://expressjs.com
- Framer Motion: https://www.framer.com/motion

---

**Enjoy building with DIForM! 🚀**

*Work Gets Done.*
