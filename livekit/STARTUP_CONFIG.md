# PM2 Auto-Startup Configuration

## ✅ Successfully Configured

Your PM2 processes (including LiveKit Agent11) are now configured to automatically start on system boot.

### 🔧 Configuration Details

**Method**: Cron job (reliable and simple)
- **Cron Entry**: `@reboot /usr/local/lib/node_modules/pm2/bin/pm2 resurrect`
- **Dump File**: `/home/husain/.pm2/dump.pm2`
- **Status**: ✅ Active and tested

### 📊 Current Processes

- `livekit-agent11` - Your production LiveKit interview agent
- `rolevate-backend` - Backend API server  
- `rolevate-frontend` - Frontend application

### 🛠️ Management Commands

Use the provided script for easy management:

```bash
# Check status and configuration
./pm2-startup.sh status

# Save current process list (run after adding new processes)
./pm2-startup.sh save

# Test startup simulation (kills and resurrects all processes)
./pm2-startup.sh test-startup

# Manual resurrection
./pm2-startup.sh resurrect
```

### 🔄 How It Works

1. **On Boot**: Cron job runs `pm2 resurrect` 
2. **PM2 Reads**: Saved process list from `/home/husain/.pm2/dump.pm2`
3. **Processes Start**: All saved processes automatically restart
4. **LiveKit Agent11**: Starts with production configuration on port 8008

### ✅ Verification

The startup configuration has been tested and verified:
- ✅ PM2 processes saved to dump file
- ✅ Cron job configured 
- ✅ Startup simulation successful
- ✅ All processes restored after restart test

### 🚨 Important Notes

- **After Adding New Processes**: Run `pm2 save` to update the dump file
- **Troubleshooting**: Check `/var/log/syslog` for cron execution logs
- **Alternative**: If cron fails, you can manually run `pm2 resurrect`

### 📋 Startup Checklist

- [x] PM2 processes saved
- [x] Cron job configured 
- [x] Startup tested and verified
- [x] Agent11 production-ready
- [x] Auto-restart on system boot enabled

Your LiveKit Agent11 will now automatically start whenever the system reboots! 🎉
