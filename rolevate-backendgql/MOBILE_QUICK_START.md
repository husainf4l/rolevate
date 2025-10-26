# Quick Start: Mobile App Integration

## ✅ Your Backend is Ready!

Your Rolevate backend is **already configured** to accept requests from mobile devices. No changes needed to the backend!

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Server IP
```bash
./get-mobile-ip.sh
```

This will show you the IP address to use in your Flutter app.

### Step 2: Start Your Backend
```bash
npm run start:dev
```

### Step 3: Configure Flutter App

In your Flutter app, create `lib/config/graphql_config.dart`:

```dart
class GraphQLConfig {
  static const String _baseUrl = 'YOUR_IP:4005'; // From step 1
  static String get httpUrl => 'http://$_baseUrl/api/graphql';
  
  // ... rest of configuration (see MOBILE_APP_INTEGRATION.md)
}
```

### Step 4: Test Connection

From your mobile device/emulator (on same WiFi):
```bash
curl http://YOUR_IP:4005/api/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}'
```

## 📋 What's Already Configured

✅ CORS allows mobile app requests (no origin header)  
✅ Bearer token authentication works with mobile  
✅ Server listens on 0.0.0.0 (accepts network connections)  
✅ GraphQL endpoint ready at `/api/graphql`  
✅ 50MB file upload limit (base64 encoding)  
✅ Rate limiting protection  

## 📱 Flutter Packages Needed

```yaml
dependencies:
  graphql_flutter: ^5.1.2
  flutter_secure_storage: ^9.0.0
  connectivity_plus: ^5.0.2
```

## 🔐 Authentication Flow

1. **Login**: Send email/password → Get JWT token
2. **Store Token**: Save in secure storage
3. **Attach Token**: Add `Bearer TOKEN` to all requests
4. **Logout**: Delete token from storage

## 📖 Full Documentation

See **MOBILE_APP_INTEGRATION.md** for:
- Complete Flutter code examples
- Authentication service implementation
- Query and mutation examples
- File upload handling
- Production deployment guide
- Troubleshooting tips

## ⚠️ Important Notes

### Development
- ✅ HTTP is okay for local development
- ✅ Mobile device must be on same WiFi
- ✅ Test with GraphQL Playground first

### Production
- ⚠️ **Must use HTTPS** (no HTTP)
- ⚠️ Set specific `ALLOWED_ORIGINS` in production
- ⚠️ Remove cleartext traffic settings from mobile apps
- ⚠️ Use SSL certificate (Let's Encrypt is free)

## 🐛 Troubleshooting

**Can't connect from mobile?**
1. Check firewall: `sudo ufw allow 4005/tcp`
2. Verify same WiFi network
3. Test with: `telnet YOUR_IP 4005`

**CORS errors?**
- Mobile apps don't send Origin header (already handled ✅)
- Check Bearer token format

**Authentication fails?**
- Verify token is saved: `Bearer YOUR_TOKEN`
- Check token not expired (7 days default)

## 🎯 Next Steps

1. ✅ Run `./get-mobile-ip.sh` to get your IP
2. ✅ Update Flutter app configuration
3. ✅ Test login from mobile app
4. ✅ Build your features!

---

**Need Help?** Check the full guide: `MOBILE_APP_INTEGRATION.md`
