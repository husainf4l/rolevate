# 🚀 Quick Reference - Critical Commands & Config

## ⚡ Essential Commands

### Setup
```bash
# Install dependencies
npm install joi @types/joi

# Generate secure JWT secret (copy output to .env)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Build and check for errors
npm run build

# Start development server
npm run start:dev
```

### Database
```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:cov

# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix
```

---

## 🔑 Required Environment Variables

### Critical (Application Won't Start Without These)
```bash
# Security
JWT_SECRET=your_64_character_hex_string_here_minimum_32_chars
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=rolevate_db

# AWS (for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=your_bucket
```

### Optional (But Recommended)
```bash
# OpenAI (for CV analysis)
OPENAI_API_KEY=sk-...

# LiveKit (for video interviews)
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
LIVEKIT_URL=wss://your-server.com

# External Services
CV_ANALYSIS_API_URL=http://localhost:8000
SYSTEM_API_KEY=your_system_key
```

---

## 🔒 Security Checklist

### Before Production Deploy
- [ ] JWT_SECRET is 32+ characters
- [ ] ALLOWED_ORIGINS set to production domains only
- [ ] All passwords are strong and unique
- [ ] .env file is NOT in version control
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints
- [ ] Authorization checks implemented
- [ ] Logging doesn't expose PII

---

## 🐛 Common Errors & Fixes

### "JWT_SECRET must be set"
```bash
# Generate and add to .env
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET" >> .env
```

### "ALLOWED_ORIGINS must be set"
```bash
echo "ALLOWED_ORIGINS=http://localhost:3000" >> .env
```

### CORS Error in Browser
```bash
# Add your frontend URL to ALLOWED_ORIGINS
ALLOWED_ORIGINS=http://localhost:3000,https://app.yourdomain.com
```

### Validation Error (400 Bad Request)
- Check input format matches DTO requirements
- Ensure UUIDs are valid v4 format
- Verify email format is correct
- Check required fields are provided

### TypeScript Build Errors
```bash
# Enable strict checks gradually if needed
# Edit tsconfig.json:
"noImplicitAny": false  # Temporarily while fixing
```

---

## 📊 Health Check Endpoints

Once implemented:
```bash
# Application health
curl http://localhost:4005/health

# Database health
curl http://localhost:4005/health/db

# Check all systems
curl http://localhost:4005/health/all
```

---

## 🔐 Security Best Practices

### Password Rules
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Never log passwords
- Always hash with bcrypt (12 rounds)

### JWT Tokens
- Include issuer and audience claims
- Set reasonable expiration (1 hour)
- Validate on every protected request
- Never expose secret in logs

### Input Validation
```typescript
// Always use class-validator decorators
@IsEmail()
@IsString()
@IsUUID('4')
@Length(8, 100)
@Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
```

### Authorization Pattern
```typescript
// Always check permissions
const user = await getUserFromRequest(req);
if (!canAccessResource(user, resource)) {
  throw new ForbiddenException();
}
```

---

## 🎯 API Testing

### GraphQL Endpoint
```bash
# Login
curl -X POST http://localhost:4005/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: {email: \"test@test.com\", password: \"Test123!@#\"}) { access_token user { id email name } } }"
  }'

# Query with auth
curl -X POST http://localhost:4005/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { me { id email name } }"
  }'
```

### Rate Limiting Test
```bash
# Should be blocked after 5 attempts
for i in {1..10}; do
  curl -X POST http://localhost:4005/api/graphql \
    -H "Content-Type: application/json" \
    -d '{"query":"mutation { login(input: {email: \"wrong@test.com\", password: \"wrong\"}) { access_token } }"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 1
done
```

---

## 📱 Frontend Integration

### Fetch Configuration
```javascript
// Correct way to call API with CORS
fetch('http://localhost:4005/api/graphql', {
  method: 'POST',
  credentials: 'include', // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: 'query { ... }',
    variables: {}
  })
})
```

### Apollo Client Setup
```javascript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4005/api/graphql',
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
```

---

## 🗂️ File Locations

### Critical Files
```
src/
├── main.ts                      # App bootstrap, CORS, validation
├── app.module.ts                # Rate limiting, CSRF, modules
├── auth/
│   ├── auth.module.ts          # JWT configuration
│   ├── jwt-auth.guard.ts       # JWT validation
│   └── login.input.ts          # Login validation
├── user/
│   └── user.service.ts         # Password hashing, user CRUD
├── config/
│   └── validation.schema.ts    # Environment validation
└── common/
    ├── authorization.service.ts # Authorization logic
    └── logging.interceptor.ts   # Request logging
```

---

## 🚨 Emergency Procedures

### Application Won't Start
1. Check JWT_SECRET length (must be 32+ chars)
2. Verify all required env vars are set
3. Run `npm run build` to see TypeScript errors
4. Check database connection
5. Review startup logs

### Security Incident Response
1. Rotate JWT_SECRET immediately
2. Check audit logs for suspicious activity
3. Review recent code changes
4. Notify team and stakeholders
5. Document incident details
6. Implement additional safeguards

### Database Migration Failure
1. Check migration status: `npm run migration:show`
2. Review migration file for errors
3. Revert if needed: `npm run migration:revert`
4. Fix migration and try again
5. Never modify existing migrations in production

---

## 📞 Quick Support

### Documentation
- Security Report: `SECURITY_AND_BEST_PRACTICES_REPORT.md`
- Fixes Applied: `FIXES_APPLIED.md`
- Implementation Guide: `IMPLEMENTATION_GUIDE.md`
- Checklist: `CHECKLIST.md`

### Common Questions
**Q: How do I generate JWT secret?**
A: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Q: Application won't start - JWT error?**
A: Set JWT_SECRET in .env with 32+ character string

**Q: CORS errors in browser?**
A: Add your frontend URL to ALLOWED_ORIGINS in .env

**Q: Validation errors (400)?**
A: Check input format matches DTO validation requirements

---

**Last Updated:** October 30, 2025  
**Version:** 1.0  
**Print this page for quick reference!**
