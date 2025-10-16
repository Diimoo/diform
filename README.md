<div align="center">

# 🚀 DIForM
### Do It For Me - Work Done, Not Just Assisted

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Desktop%20%7C%20Mobile%20%7C%20Web-blue)](https://github.com/Diimoo/diform)
[![AI](https://img.shields.io/badge/AI-Local%20First-green)](https://github.com/Diimoo/diform)
[![Microsoft 365](https://img.shields.io/badge/Microsoft%20365-Integrated-orange)](https://github.com/Diimoo/diform)

**Enterprise AI productivity platform that understands context, decides the next logical step, and proactively executes it.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture) • [Contributing](#-contributing)

![DIForM Demo](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=DIForM+Demo)

</div>

---

## 🚀 Features

### Core Experiences

- **Outlook Integration**: Email thread summarization, response drafting with tone adjustment, and auto-follow-ups
- **Document Creation**: From briefing to first draft with sources, rewriting, and deck generation with corporate design
- **Data Analysis**: Natural language queries, automatic analysis, visualization, and what-if scenarios
- **Meeting Intelligence**: Live summaries, decision tracking, and context-aware integrations

### Architecture Highlights
- **Foundation LLMs + Orchestrator**: Understand → Plan → Execute → Verify workflow
- **Microsoft Graph Grounding**: Secure access to Mail, Files, Calendar, Teams, People, Sites
- **Action Connectors**: Integrations with Outlook, SharePoint, Planner, Power Automate, Jira, ServiceNow, GitHub, SAP
- **Guardrails**: Policy enforcement, DLP, sensitivity labels, E5 compliance, least privilege access

## 💻 Platforms

DIForM runs on **all major platforms**:

| Platform | Status | Technology |
|----------|--------|------------|
| 🖥️ **Desktop** | ✅ Production Ready | Electron (Windows, macOS, Linux) |
| 📱 **Mobile** | ✅ Production Ready | React Native (iOS, Android) |
| 🌐 **Web** | ✅ Production Ready | React 18 + PWA |

## 🤖 Local AI - Zero API Costs

**Two AI systems included** for complete privacy and zero costs:

### Ollama (Desktop/Backend)
- ✅ Llama 3.2, Mistral, CodeLlama
- ✅ Runs 100% offline
- ✅ Full reasoning capabilities
- ✅ No external API calls

### Transformers.js (Browser)
- ✅ In-browser AI processing
- ✅ No backend required
- ✅ Works offline after first load
- ✅ ~100MB model size

**Cost**: $0/month (vs $20-200/month for cloud AI APIs)

## 🔐 Real Microsoft 365 Integration

- ✅ OAuth 2.0 authentication
- ✅ Read/Send real emails (Microsoft Graph)
- ✅ Access calendar and create meetings
- ✅ OneDrive and SharePoint file access
- ✅ Secure token management

## 🏭 Tech Stack

**Frontend**
- React 18, Framer Motion, Axios
- React Native (Mobile)
- Custom CSS with modern design

**Backend**
- Node.js + Express
- Ollama SDK for local LLM
- Microsoft Graph SDK

**Desktop**
- Electron with native integrations
- @azure/msal-node for auth

**AI**
- Ollama (Llama 3.2, Mistral, etc.)
- Transformers.js (DistilBERT)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (v5 or higher) - for data persistence
- Ollama (optional) - for local AI

### Quick Setup

Run the automated setup script:
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:Diimoo/diform.git
   cd diform
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings (see below)
   ```

4. **Set up MongoDB**
   ```bash
   # Option A: Using Docker
   docker-compose up mongodb -d
   
   # Option B: Local MongoDB
   mongod --dbpath=/path/to/data
   ```

5. **Configure required environment variables**
   
   Edit `.env` and set:
   ```bash
   # Database (REQUIRED)
   MONGODB_URI=mongodb://localhost:27017/diform
   
   # JWT Authentication (REQUIRED)
   # Generate with: openssl rand -base64 32
   JWT_SECRET=your-secret-key-here-minimum-32-characters
   
   # Azure AD (for Electron app)
   AZURE_CLIENT_ID=your-azure-client-id
   ```

6. **Install Local AI (Optional but Recommended)**
   ```bash
   ./INSTALL_OLLAMA.sh
   ollama serve
   ```

## 🎯 Usage

### Development Mode

Run both the backend and frontend concurrently:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- React development server on `http://localhost:3000`

### Individual Commands

**Run backend only:**
```bash
npm run server
```

**Run frontend only:**
```bash
npm run client
```

**Build for production:**
```bash
npm run build
```

**Run production build:**
```bash
npm start
```

## 🎨 Project Structure

```
diform/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Navigation.js
│   │   │   ├── Hero.js
│   │   │   ├── Features.js
│   │   │   ├── Architecture.js
│   │   │   ├── Demo.js
│   │   │   ├── Security.js
│   │   │   └── Footer.js
│   │   ├── App.js         # Main app component
│   │   ├── index.js       # Entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── server/                # Express backend
│   └── index.js          # API server
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── package.json         # Root dependencies
├── ROADMAP.md          # Product vision
├── beispiel.html       # Design reference
└── README.md           # This file
```

## 🔐 Authentication

DIForM now includes JWT-based authentication for secure API access.

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

Response includes a JWT token:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Using the Token

Include the token in the `Authorization` header for all protected endpoints:
```bash
Authorization: Bearer <your-jwt-token>
```

## 🔌 API Endpoints

### Public Endpoints

#### Health Check
```
GET /api/health
```
Returns server health status and database connection.

#### Authentication
```
POST /api/auth/register  - Register new user
POST /api/auth/login     - Login user
GET  /api/auth/me        - Get current user (requires auth)
POST /api/auth/logout    - Logout user (requires auth)
```

### Protected Endpoints (Require Authentication)

#### Process Command
```
POST /api/process
Authorization: Bearer <token>
```
**Body:**
```json
{
  "command": "Your DIForM command here",
  "context": {}
}
```
**Response:**
```json
{
  "success": true,
  "taskId": "uuid",
  "task": {
    "id": "uuid",
    "command": "...",
    "status": "completed",
    "steps": [...]
  }
}
```

#### Get Task Status
```
GET /api/task/:taskId
Authorization: Bearer <token>
```
Returns the status and details of a specific task.

#### Execution History
```
GET /api/history?page=1&limit=10
Authorization: Bearer <token>
```
Returns paginated execution history for the authenticated user.

## 🎭 Interactive Demo

The application includes a fully interactive demo that simulates the DIForM AI processing:

1. Click "Try Interactive Demo" or "Try Demo" button
2. Enter a command or select from example prompts
3. Watch as DIForM processes your request through:
   - **Understand**: Analyzes your request
   - **Plan**: Creates execution steps
   - **Execute**: Performs actions
   - **Verify**: Validates and logs results

### Example Commands

- "Summarize the last 48h customer emails for Project X, draft responses, schedule 2 meetings next week, and update the steering deck."
- "Create a QBR presentation from this Excel data with risks, opportunities and 3 recommendations - max 10 slides."
- "Prepare onboarding checklist, assign tasks in Planner, and invite everyone to the kick-off meeting."
- "Explain the Q3 variances, create pivot table, generate chart, and provide recommendations."

## 🔐 Security & Compliance

- **Tenant-Boundary Security**: Data stays within your Microsoft 365 tenant
- **Complete Audit Trail**: Every action logged with full context
- **Policy Enforcement**: Built-in DLP, sensitivity labels, E5 compliance
- **Human-in-the-Loop**: Approval workflows for risky operations

## 🚢 Deployment

### Production Build

1. Build the client:
   ```bash
   cd client && npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

The server will serve the React build from the `client/build` directory.

## 📝 Development

### Code Style
- Component-based architecture
- CSS modules for styling
- Framer Motion for smooth animations
- Responsive design (mobile-first)

### Best Practices
- Use functional components with hooks
- Implement proper error handling
- Follow React best practices
- Write clean, maintainable code

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For questions or support, please contact the DIForM team.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

## 📞 Support

For questions, issues, or support:
- 📧 Create an issue on GitHub
- 💬 Join our discussions
- 📚 Check the [documentation](docs/)

---

<div align="center">

**Built with ❤️ for enterprise productivity**

*Work Gets Done.* 🚀

[⬆ Back to Top](#-diform)

</div>
