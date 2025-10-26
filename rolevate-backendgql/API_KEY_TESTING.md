# API Key Testing Guide

## Your System API Key
```
31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e
```

## ✅ How to Use the API Key

### Header Format
The API key MUST be sent in the `x-api-key` header (lowercase):

```
x-api-key: 31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e
```

### ❌ Common Mistakes

1. **Wrong Header Name**
   - ❌ `X-API-Key` (wrong capitalization)
   - ❌ `api-key` (missing x-)
   - ❌ `Authorization` (wrong header)
   - ✅ `x-api-key` (correct)

2. **Wrong Format**
   - ❌ `Bearer 31a29647...` (no Bearer prefix needed)
   - ✅ `31a29647...` (just the key)

## 🧪 Testing with cURL

### Test 1: Simple Query (Public - No Auth Needed)
```bash
curl http://192.168.1.164:4005/api/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}'
```

### Test 2: Query with API Key
```bash
curl http://192.168.1.164:4005/api/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: 31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e" \
  -d '{"query":"query { jobs { id title } }"}'
```

### Test 3: Mutation with API Key
```bash
curl http://192.168.1.164:4005/api/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: 31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e" \
  -d '{
    "query": "mutation { createApplication(input: { jobId: \"xxx\", candidateId: \"xxx\" }) { id } }"
  }'
```

## 📱 Flutter Implementation

### GraphQL Client with API Key

```dart
import 'package:graphql_flutter/graphql_flutter.dart';

class GraphQLConfig {
  static const String _baseUrl = '192.168.1.164:4005';
  static const String _apiKey = '31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e';
  
  Future<GraphQLClient> getClient() async {
    final HttpLink httpLink = HttpLink(
      'http://$_baseUrl/api/graphql',
    );
    
    // Create a custom link that adds the API key header
    final Link apiKeyLink = HttpLink(
      'http://$_baseUrl/api/graphql',
      defaultHeaders: {
        'x-api-key': _apiKey,  // ✅ Correct header name (lowercase)
      },
    );
    
    return GraphQLClient(
      link: apiKeyLink,
      cache: GraphQLCache(store: InMemoryStore()),
    );
  }
}
```

### Alternative: Using AuthLink with API Key

```dart
import 'package:graphql_flutter/graphql_flutter.dart';

class GraphQLConfig {
  static const String _baseUrl = '192.168.1.164:4005';
  static const String _apiKey = '31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e';
  
  Future<GraphQLClient> getClient() async {
    final HttpLink httpLink = HttpLink(
      'http://$_baseUrl/api/graphql',
    );
    
    // Custom AuthLink for API key
    final AuthLink authLink = AuthLink(
      getToken: () async => _apiKey,
      headerKey: 'x-api-key',  // ✅ Specify the header key
    );
    
    final Link link = authLink.concat(httpLink);
    
    return GraphQLClient(
      link: link,
      cache: GraphQLCache(store: InMemoryStore()),
    );
  }
}
```

### With Both JWT and API Key Support

```dart
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class GraphQLConfig {
  static const String _baseUrl = '192.168.1.164:4005';
  static const String _apiKey = '31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e';
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  Future<GraphQLClient> getClient({bool useJwt = true}) async {
    final HttpLink httpLink = HttpLink(
      'http://$_baseUrl/api/graphql',
    );
    
    if (useJwt) {
      // Use JWT authentication
      final token = await _storage.read(key: 'access_token');
      final AuthLink authLink = AuthLink(
        getToken: () async => token != null ? 'Bearer $token' : null,
      );
      return GraphQLClient(
        link: authLink.concat(httpLink),
        cache: GraphQLCache(store: InMemoryStore()),
      );
    } else {
      // Use API key authentication
      final Link apiKeyLink = HttpLink(
        'http://$_baseUrl/api/graphql',
        defaultHeaders: {
          'x-api-key': _apiKey,
        },
      );
      return GraphQLClient(
        link: apiKeyLink,
        cache: GraphQLCache(store: InMemoryStore()),
      );
    }
  }
}
```

## 🔍 Which Endpoints Support API Keys?

Based on your code, these endpoints accept API keys:

### ✅ API Key Guard (API Key Only)
- `analyzeApplication` - Analyze job application
- `updateApplicationAnalysis` - Update application analysis
- `uploadApplicationDocuments` - Upload documents
- `getUserByEmail` - Get user by email

### ✅ JWT or API Key Guard (Either Works)
- `applications` - List applications
- `application` - Get single application
- `updateApplication` - Update application

### ✅ Business or API Key Guard
- SMS-related mutations

### ❌ JWT Only (API Key Won't Work)
- `login` - Authentication
- `changePassword` - Password change
- Most user profile operations

## 🐛 Troubleshooting

### Issue: Still getting "Forbidden" error

**Check the following:**

1. **Correct Header Name**
   ```bash
   # ✅ Correct
   -H "x-api-key: 31a29647..."
   
   # ❌ Wrong
   -H "X-API-Key: 31a29647..."
   -H "api-key: 31a29647..."
   ```

2. **No Extra Spaces**
   ```bash
   # ✅ Correct
   x-api-key: 31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e
   
   # ❌ Wrong (space before key)
   x-api-key:  31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e
   ```

3. **Check Endpoint Requires API Key**
   - Not all endpoints accept API keys
   - Some require JWT authentication only
   - Check the resolver decorators (`@UseGuards`)

4. **Verify Backend is Running**
   ```bash
   npm run start:dev
   ```

5. **Check Backend Logs**
   - Look for "✅ System API key validated" message
   - Check for any errors in console

### Test API Key Validation

Add this temporary test to verify the key works:

```bash
# In your backend, check if the key is loaded
curl http://192.168.1.164:4005/api/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: 31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e" \
  -d '{"query":"query { __typename }"}'
```

### Enable Debug Logging

Temporarily add logging to see what's being received:

```typescript
// In src/auth/api-key.guard.ts
async canActivate(context: ExecutionContext): Promise<boolean> {
  const ctx = GqlExecutionContext.create(context);
  const request = ctx.getContext().req;
  const apiKey = request.headers['x-api-key'];
  
  console.log('📝 Headers received:', Object.keys(request.headers));
  console.log('🔑 API Key from header:', apiKey ? '***' + apiKey.slice(-8) : 'NOT FOUND');
  
  if (!apiKey) return false;
  return this.apiKeyService.validateApiKey(apiKey);
}
```

## 🔐 Security Notes

### For Development
- ✅ API key in environment variable
- ✅ API key in Flutter app (for testing)

### For Production
- ⚠️ **Never hardcode API keys in mobile apps for production**
- ✅ Use JWT authentication for user-facing features
- ✅ API keys should only be used for:
  - Server-to-server communication
  - Background jobs
  - Internal services
- ✅ Rotate API keys regularly
- ✅ Use different keys for different environments

## 📊 Testing Checklist

- [ ] Backend is running (`npm run start:dev`)
- [ ] SYSTEM_API_KEY is set in `.env`
- [ ] API key is sent in `x-api-key` header (lowercase)
- [ ] No `Bearer` prefix for API key
- [ ] Endpoint supports API key authentication
- [ ] No extra spaces or special characters
- [ ] Backend logs show successful validation

---

**Last Updated**: October 26, 2025
