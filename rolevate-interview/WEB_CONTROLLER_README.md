# 🎛️ Rolevate Agent Web Controller

## 📊 CURRENT SITUATION REPORT

### **Pr### **3. Start the Web Controller**

```bash
# Method 1: Direct run
python web_controller.py

# Method 2: With uvicorn
uvicorn web_controller:app --reload --host 0.0.0.0 --port 8004
```

### **4. Access the Dashboard**

Open your browser and navigate to:
- 🎛️ **Dashboard**: http://localhost### **Option 2: Production with Gunicorn**
```bash
gunico### **Immediate Actions**
1. ✅ Install neFor issues or questions:
1. Check logs: `/api/logs/error`
2. Review API docs: http://localhost:8004/docs
3. Check health: http://localhost:8004/health
4. Monitor status: Dashboard metricsendencies: `pip install -r requirements.txt`
2. ✅ Fix ecosystem.config.js path (already done)
3. ✅ Test web controller: `python web_controller.py`
4. ✅ Access dashboard: http://localhost:8004b_controller:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8004
```

### **Option 3: Docker Container**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8004
CMD ["uvicorn", "web_controller:app", "--host", "0.0.0.0", "--port", "8004"]
```ocs**: http://localhost:8004/docs
- 🔍 **Health Check**: http://localhost:8004/health **Operational**: Core interview agent is functional and well-structured  
✅ **Fixed**: PM2 configuration updated from macOS to Linux paths  
✅ **Enhanced**: Web controller interface added for monitoring and control

### **Architecture Overview**

#### **Backend Components**
1. **LiveKit Agent System**
   - Real-time voice interaction platform
   - STT: Soniox (Arabic & English support)
   - LLM: OpenAI GPT-4o-mini
   - TTS: ElevenLabs natural voice
   - VAD: Silero voice activity detection

2. **API Integration**
   - GraphQL client for Rolevate backend
   - Fetches candidate, job, company info
   - Personalizes interviews dynamically

3. **Web Controller (NEW)**
   - FastAPI REST API backend
   - Vue.js reactive frontend
   - Real-time WebSocket updates
   - System monitoring with psutil

#### **Code Quality**
- ✅ Modular architecture with separation of concerns
- ✅ Type hints and comprehensive documentation
- ✅ Environment-based configuration
- ✅ Error handling and logging throughout
- ✅ Bilingual support (English/Arabic) with strict enforcement

---

## 🚀 Quick Start Guide

### **1. Install Dependencies**

```bash
# Activate virtual environment
source venv/bin/activate

# Install all dependencies (including web controller)
pip install -r requirements.txt
```

### **2. Configure Environment**

Make sure your `.env` file contains all required variables:

```bash
# LiveKit Configuration
LIVEKIT_URL=wss://your-livekit-instance.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# ElevenLabs TTS Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=EkK5I93UQWFDigLMpZcX

# Soniox STT Configuration
SONIOX_API_KEY=your_soniox_api_key

# Rolevate API Configuration
ROLEVATE_API_URL=https://rolevate.com/api/graphql
ROLEVATE_API_KEY=your_rolevate_api_key
```

### **3. Start the Web Controller**

```bash
# Method 1: Direct run
python web_controller.py

# Method 2: With uvicorn
uvicorn web_controller:app --reload --host 0.0.0.0 --port 8080
```

### **4. Access the Dashboard**

Open your browser and navigate to:
- 🎛️ **Dashboard**: http://localhost:8080
- 📚 **API Docs**: http://localhost:8080/docs
- 🔍 **Health Check**: http://localhost:8080/health

---

## 🎯 Web Controller Features

### **Real-Time Monitoring**
- ✅ Agent status (running/stopped)
- ✅ Uptime tracking
- ✅ Memory usage monitoring
- ✅ CPU usage tracking
- ✅ Active sessions counter
- ✅ System information display

### **Agent Control**
- ▶️ **Start**: Launch the agent via PM2 or directly
- ⏹️ **Stop**: Gracefully terminate the agent
- 🔄 **Restart**: Stop and start in one action
- 🔃 **Refresh**: Update status manually

### **Interview Management**
- 🔍 **Lookup**: Fetch interview details by Application ID
- 📋 **Display**: View candidate, job, company, and language info
- 🔗 **API Integration**: Direct connection to Rolevate backend

### **Log Viewer**
- 📜 **Combined Logs**: All application output
- 📤 **Output Logs**: Standard output only
- ❌ **Error Logs**: Errors and warnings
- 🔄 **Auto-refresh**: Real-time log streaming

### **WebSocket Updates**
- ⚡ Real-time status updates every 2 seconds
- 📊 Automatic metric refresh
- 🔌 Auto-reconnect on connection loss

---

## 📡 API Endpoints

### **Status & System**
- `GET /api/status` - Get agent status
- `GET /api/system` - Get system information
- `GET /health` - Health check

### **Agent Control**
- `POST /api/agent/start` - Start the agent
- `POST /api/agent/stop` - Stop the agent
- `POST /api/agent/restart` - Restart the agent

### **Interview Details**
- `POST /api/interview/details` - Fetch interview context
  ```json
  {
    "application_id": "354046a3-44a5-48ee-9d84-6bd7c7b3455c"
  }
  ```

### **Logs**
- `GET /api/logs/combined?lines=100` - Combined logs
- `GET /api/logs/out?lines=100` - Output logs
- `GET /api/logs/error?lines=100` - Error logs

### **WebSocket**
- `WS /ws` - Real-time status updates

---

## 🛠️ Development Workflow

### **Running the Agent Only**

```bash
# Development mode with auto-reload
python main.py dev

# Or using VS Code task
# Run Task: "Run Agent Dev"
```

### **Running with Web Controller**

```bash
# Terminal 1: Start web controller
python web_controller.py

# Terminal 2: Start agent (or use web UI)
python main.py dev
```

### **Using PM2 (Production)**

```bash
# Start agent with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs rolevate-agent

# Stop agent
pm2 stop rolevate-agent

# Restart agent
pm2 restart rolevate-agent

# Delete from PM2
pm2 delete rolevate-agent
```

---

## 🐛 Troubleshooting

### **Web Controller Won't Start**

1. Check if port 8004 is available:
   ```bash
   lsof -i :8004
   ```

2. Install missing dependencies:
   ```bash
   pip install fastapi uvicorn psutil pydantic websockets
   ```

### **Agent Not Detected**

The web controller looks for processes with `main.py` in the command line. If you renamed the file or are running via PM2, the controller should still detect it.

### **WebSocket Connection Failed**

This is normal if the agent isn't running. The controller will automatically retry. Check browser console for details.

### **Interview Details Not Found**

1. Verify `ROLEVATE_API_KEY` is set correctly
2. Check the Application ID format (must be a valid UUID)
3. Review logs for API errors: `/api/logs/error`

---

## 📈 Performance Tips

### **Memory Management**
- Agent restarts automatically if memory exceeds 1GB (PM2 config)
- Monitor memory usage in the web dashboard
- Check for memory leaks in long-running sessions

### **CPU Usage**
- Normal: 5-20% during idle
- Interview: 30-60% during active sessions
- High: >80% may indicate issues

### **Optimization**
- Use PM2 for production (auto-restart, clustering)
- Enable log rotation for large log files
- Monitor system metrics regularly

---

## 🔐 Security Considerations

### **Production Deployment**

1. **Use HTTPS**: Configure SSL/TLS certificates
2. **Authentication**: Add authentication layer (JWT, OAuth)
3. **API Keys**: Store in environment variables, never commit
4. **CORS**: Configure allowed origins
5. **Rate Limiting**: Add rate limiting to prevent abuse

### **Recommended Additions**

```python
# Add to web_controller.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["yourdomain.com", "*.yourdomain.com"]
)
```

---

## 📦 Project Structure

```
rolevate-interview/
├── agent.py                 # Agent implementation
├── api_client.py            # GraphQL API client
├── config.py                # Configuration
├── main.py                  # Agent entry point
├── models.py                # Data models
├── utils.py                 # Utility functions
├── web_controller.py        # FastAPI web controller (NEW)
├── requirements.txt         # Python dependencies
├── ecosystem.config.js      # PM2 configuration
├── .env                     # Environment variables
├── static/
│   └── controller.html      # Web dashboard UI (NEW)
└── logs/
    ├── pm2-combined.log
    ├── pm2-error.log
    └── pm2-out.log
```

---

## 🎨 UI Features

### **Dashboard Components**

1. **Header**
   - Real-time agent status indicator
   - Current timestamp
   - Rolevate branding

2. **Control Panel**
   - Start/Stop/Restart buttons
   - Status-aware button states
   - Refresh button

3. **Metrics Grid**
   - 4-card layout with icons
   - Color-coded indicators
   - Auto-updating values

4. **Interview Lookup**
   - UUID input with validation
   - Real-time API integration
   - Formatted result display

5. **System Info**
   - Platform details
   - Resource information
   - Hardware specs

6. **Log Viewer**
   - Tab-based log selection
   - Syntax highlighting
   - Auto-scroll option
   - Terminal-style display

---

## 🚢 Deployment Options

### **Option 1: Local Development**
```bash
python web_controller.py
```

### **Option 2: Production with Gunicorn**
```bash
gunicorn web_controller:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8080
```

### **Option 3: Docker Container**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080
CMD ["uvicorn", "web_controller:app", "--host", "0.0.0.0", "--port", "8080"]
```

### **Option 4: Systemd Service**
```ini
[Unit]
Description=Rolevate Web Controller
After=network.target

[Service]
Type=simple
User=husain
WorkingDirectory=/home/husain/rolevate/rolevate-interview
Environment="PATH=/home/husain/rolevate/rolevate-interview/venv/bin"
ExecStart=/home/husain/rolevate/rolevate-interview/venv/bin/python web_controller.py
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 📝 Next Steps

### **Immediate Actions**
1. ✅ Install new dependencies: `pip install -r requirements.txt`
2. ✅ Fix ecosystem.config.js path (already done)
3. ✅ Test web controller: `python web_controller.py`
4. ✅ Access dashboard: http://localhost:8080

### **Enhancements to Consider**
- 🔐 Add authentication/authorization
- 📊 Database for session history
- 📧 Email/Slack notifications
- 📈 Advanced analytics dashboard
- 🎤 Audio recording management
- 🌐 Multi-language UI support
- 📱 Mobile-responsive design improvements
- 🔔 Real-time alerts for errors

---

## 🤝 Contributing

When adding features:
1. Update API endpoints in `web_controller.py`
2. Add corresponding UI in `static/controller.html`
3. Update this README with new features
4. Test thoroughly in dev mode
5. Update requirements.txt if needed

---

## 📄 License

[Your License Here]

---

## 🆘 Support

For issues or questions:
1. Check logs: `/api/logs/error`
2. Review API docs: http://localhost:8080/docs
3. Check health: http://localhost:8080/health
4. Monitor status: Dashboard metrics

---

**Built with ❤️ for Rolevate**
