# 🚀 Agent15 Production Deployment Guide - macOS

## ✅ **COMPLETED CONFIGURATIONS**

### 🔋 **Power Management (DONE)**

- ✅ System sleep: **DISABLED** (never sleeps)
- ✅ Disk sleep: **DISABLED** (disks stay active)
- ✅ Standby mode: **DISABLED**
- ✅ Wake on network: **ENABLED**
- ✅ Power Nap: **ENABLED** (maintains network connectivity)
- ✅ Auto-restart after power failure: **ENABLED**
- ✅ Display sleep: **10 minutes** (saves energy while keeping system active)

### 📊 **Process Management (DONE)**

- ✅ PM2 configured for Agent15
- ✅ Auto-restart on failure
- ✅ Logging configured
- ✅ Memory limits set (2GB max)
- ✅ Process monitoring active

## 🎯 **HOW TO OPERATE AGENT15 IN PRODUCTION**

### **Start Agent15**

```bash
cd /Users/al-husseinabdullah/Desktop/rolevate/livekit
./agent15-manager.sh start
```

### **Check Status**

```bash
./agent15-manager.sh status
```

### **View Logs**

```bash
./agent15-manager.sh logs          # All logs
./agent15-manager.sh logs-error    # Error logs only
```

### **Restart Agent15**

```bash
./agent15-manager.sh restart       # Hard restart
./agent15-manager.sh reload        # Zero-downtime restart
```

### **Stop Agent15**

```bash
./agent15-manager.sh stop
```

### **Monitor Performance**

```bash
./agent15-manager.sh monitor       # Opens PM2 monitoring dashboard
```

## 🔧 **ADDITIONAL MANUAL CONFIGURATIONS NEEDED**

### 1. **System Preferences** (Manual Setup Required)

- Go to **System Preferences > Energy Saver**
- Verify "Prevent computer from sleeping automatically" is checked
- Go to **System Preferences > Sharing**
- Enable "Remote Login" if you need SSH access

### 2. **Firewall Configuration** (If Needed)

```bash
# Allow incoming connections on port 8008 (Agent15 port)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /Users/al-husseinabdullah/Desktop/rolevate/livekit/venv/bin/python
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /Users/al-husseinabdullah/Desktop/rolevate/livekit/venv/bin/python
```

### 3. **Network Configuration**

- Ensure your Mac has a static IP address
- Configure port forwarding if behind a router
- Test external connectivity to port 8008

## 📈 **MONITORING & MAINTENANCE**

### **Health Checks**

```bash
./agent15-manager.sh health
```

### **System Resource Monitoring**

```bash
# Check CPU and Memory usage
top -pid $(pgrep -f "agent15/main.py")

# Check disk space
df -h

# Check network connectivity
ping -c 3 rolvate2-ckmk80qb.livekit.cloud
```

### **Log Rotation**

Logs are automatically rotated by the logging configuration:

- Debug logs: `/Users/al-husseinabdullah/Desktop/rolevate/livekit/logs/agent11-debug.log`
- Error logs: `/Users/al-husseinabdullah/Desktop/rolevate/livekit/logs/agent11-errors.log`
- PM2 logs: `./logs/agent15-*.log`

## 🚨 **TROUBLESHOOTING**

### **Agent15 Won't Start**

1. Check virtual environment: `source venv/bin/activate`
2. Check dependencies: `pip list`
3. Check environment variables: `cat .env`
4. Check logs: `./agent15-manager.sh logs-error`

### **High Memory Usage**

- Agent15 is configured with 2GB memory limit
- Restart if needed: `./agent15-manager.sh restart`

### **Network Issues**

1. Test LiveKit connection: `ping rolvate2-ckmk80qb.livekit.cloud`
2. Check firewall settings
3. Verify environment variables in `.env`

## 📱 **CURRENT STATUS**

- **Agent15**: ✅ RUNNING (PID: 53439)
- **Power Management**: ✅ CONFIGURED FOR 24/7 OPERATION
- **Auto-restart**: ✅ ENABLED
- **Logging**: ✅ ACTIVE
- **Memory Limit**: ✅ 2GB MAX
- **Port**: ✅ 8008
- **LiveKit Connection**: ✅ CONNECTED (Israel region)

## 🎉 **YOUR MAC IS PRODUCTION READY!**

Your macOS system is now configured for 24/7 server operation. Agent15 will:

- ✅ Start automatically on boot
- ✅ Restart automatically on failure
- ✅ Never sleep or hibernate
- ✅ Maintain network connections
- ✅ Log all activity
- ✅ Handle up to 2GB memory usage
- ✅ Auto-restart after power failures
