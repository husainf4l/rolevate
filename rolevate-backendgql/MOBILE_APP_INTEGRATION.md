# Mobile App Integration Guide

## Overview
This guide explains how to integrate Flutter mobile applications (Android & iOS) with the Rolevate GraphQL backend.

## Backend Configuration ✅

### Current Setup (Already Configured)
Your backend is **already configured** to accept mobile requests:

1. **CORS Configuration** - Allows requests with no origin (mobile apps)
2. **Bearer Token Authentication** - Works seamlessly with mobile apps
3. **GraphQL API** - Platform-agnostic communication
4. **Fastify Server** - Listening on `0.0.0.0` for network access

## Flutter Integration

### 1. Required Packages

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  graphql_flutter: ^5.1.2
  flutter_secure_storage: ^9.0.0
  http: ^1.1.0
  connectivity_plus: ^5.0.2
```

### 2. GraphQL Client Setup

#### a. Create GraphQL Configuration (`lib/config/graphql_config.dart`)

```dart
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class GraphQLConfig {
  static const String _baseUrl = 'YOUR_SERVER_IP:4005'; // Change this
  static const String _graphqlEndpoint = '/api/graphql';
  
  // For development
  static String get httpUrl => 'http://$_baseUrl$_graphqlEndpoint';
  
  // For production (use HTTPS)
  static String get httpsUrl => 'https://$_baseUrl$_graphqlEndpoint';
  
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  Future<GraphQLClient> getClient() async {
    final HttpLink httpLink = HttpLink(
      httpUrl, // Use httpsUrl for production
    );
    
    // Get token from secure storage
    final token = await _storage.read(key: 'access_token');
    
    final AuthLink authLink = AuthLink(
      getToken: () async => token != null ? 'Bearer $token' : null,
    );
    
    final Link link = authLink.concat(httpLink);
    
    return GraphQLClient(
      link: link,
      cache: GraphQLCache(store: InMemoryStore()),
    );
  }
  
  Future<void> saveToken(String token) async {
    await _storage.write(key: 'access_token', value: token);
  }
  
  Future<void> deleteToken() async {
    await _storage.delete(key: 'access_token');
  }
}
```

### 3. Authentication Service

#### Create Auth Service (`lib/services/auth_service.dart`)

```dart
import 'package:graphql_flutter/graphql_flutter.dart';
import '../config/graphql_config.dart';

class AuthService {
  final GraphQLConfig _config = GraphQLConfig();
  
  Future<Map<String, dynamic>> login(String email, String password) async {
    final client = await _config.getClient();
    
    const String loginMutation = r'''
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          access_token
          user {
            id
            email
            name
            userType
            phone
            avatar
            isActive
            companyId
            company {
              id
              name
              logo
              industry
            }
          }
        }
      }
    ''';
    
    try {
      final result = await client.mutate(
        MutationOptions(
          document: gql(loginMutation),
          variables: {
            'input': {
              'email': email,
              'password': password,
            },
          },
        ),
      );
      
      if (result.hasException) {
        throw Exception(result.exception.toString());
      }
      
      final data = result.data?['login'];
      if (data != null) {
        // Save token
        await _config.saveToken(data['access_token']);
        return data;
      }
      
      throw Exception('Login failed');
    } catch (e) {
      rethrow;
    }
  }
  
  Future<void> logout() async {
    await _config.deleteToken();
  }
}
```

### 4. Main App Setup

#### Configure GraphQL Provider (`lib/main.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'config/graphql_config.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize GraphQL client
  await initHiveForFlutter();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<GraphQLClient>(
      future: GraphQLConfig().getClient(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const MaterialApp(
            home: Scaffold(
              body: Center(child: CircularProgressIndicator()),
            ),
          );
        }
        
        return GraphQLProvider(
          client: ValueNotifier(snapshot.data!),
          child: MaterialApp(
            title: 'Rolevate',
            theme: ThemeData(
              primarySwatch: Colors.blue,
            ),
            home: const LoginScreen(),
          ),
        );
      },
    );
  }
}
```

### 5. Example Query/Mutation Usage

#### Login Screen Example

```dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);
    
    try {
      final result = await _authService.login(
        _emailController.text,
        _passwordController.text,
      );
      
      // Navigate to home screen
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _handleLogin,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}
```

#### Query Example (Fetch Jobs)

```dart
import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

class JobsScreen extends StatelessWidget {
  const JobsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    const String jobsQuery = r'''
      query GetJobs {
        jobs {
          id
          title
          description
          location
          jobType
          experienceLevel
          salaryMin
          salaryMax
          company {
            id
            name
            logo
          }
        }
      }
    ''';

    return Scaffold(
      appBar: AppBar(title: const Text('Jobs')),
      body: Query(
        options: QueryOptions(
          document: gql(jobsQuery),
          pollInterval: const Duration(seconds: 30),
        ),
        builder: (QueryResult result, {fetchMore, refetch}) {
          if (result.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (result.hasException) {
            return Center(
              child: Text('Error: ${result.exception.toString()}'),
            );
          }

          final jobs = result.data?['jobs'] as List?;
          
          if (jobs == null || jobs.isEmpty) {
            return const Center(child: Text('No jobs found'));
          }

          return ListView.builder(
            itemCount: jobs.length,
            itemBuilder: (context, index) {
              final job = jobs[index];
              return ListTile(
                leading: job['company']?['logo'] != null
                    ? Image.network(job['company']['logo'])
                    : const Icon(Icons.business),
                title: Text(job['title']),
                subtitle: Text(job['company']?['name'] ?? ''),
                onTap: () {
                  // Navigate to job details
                },
              );
            },
          );
        },
      ),
    );
  }
}
```

## Network Configuration

### Android Configuration

#### 1. Enable Internet Permission (`android/app/src/main/AndroidManifest.xml`)

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Add these permissions -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    
    <application
        android:label="rolevate"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:usesCleartextTraffic="true"> <!-- Allow HTTP in development -->
        <!-- ... rest of config ... -->
    </application>
</manifest>
```

**Important**: For production, remove `android:usesCleartextTraffic="true"` and use HTTPS only.

### iOS Configuration

#### 1. Configure App Transport Security (`ios/Runner/Info.plist`)

For development with HTTP:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <!-- Or be more specific -->
    <key>NSExceptionDomains</key>
    <dict>
        <key>YOUR_SERVER_IP</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
    </dict>
</dict>
```

**Important**: For production, remove this and use HTTPS only.

## Testing Your Setup

### 1. Find Your Server IP Address

On your development machine, run:

```bash
# Linux/macOS
ip addr show | grep "inet "
# or
ifconfig | grep "inet "

# Windows
ipconfig
```

Look for your local network IP (usually `192.168.x.x` or `10.0.x.x`)

### 2. Update Flutter Config

In your `graphql_config.dart`, replace:
```dart
static const String _baseUrl = '192.168.1.100:4005'; // Your actual IP
```

### 3. Test Connection

Ensure your mobile device is on the same network as your development machine.

### 4. Test from Device

```bash
# From your mobile device or emulator, test the connection:
curl http://YOUR_SERVER_IP:4005/api/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}'
```

## Production Deployment

### 1. Use HTTPS

For production, you must use HTTPS. Set up SSL certificates using:
- Let's Encrypt (free)
- AWS Certificate Manager
- Cloudflare SSL

### 2. Update Backend for Production

Add your production domain to allowed origins:

```bash
# Set environment variable
export ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 3. Update Flutter Config

```dart
// Use production URL
static const String _baseUrl = 'api.yourdomain.com';
static String get url => 'https://$_baseUrl$_graphqlEndpoint';
```

### 4. Remove Development Settings

- Remove `android:usesCleartextTraffic="true"` from Android
- Remove `NSAllowsArbitraryLoads` from iOS
- Use only HTTPS connections

## Troubleshooting

### Issue: Cannot connect from mobile device

**Solution:**
1. Ensure backend is listening on `0.0.0.0` (already configured) ✅
2. Check firewall allows port 4005
3. Verify mobile device is on same network
4. Test with: `telnet YOUR_SERVER_IP 4005`

### Issue: CORS errors on mobile

**Solution:**
- Mobile apps don't send Origin header, already handled ✅
- Check that credentials are being sent correctly

### Issue: Authentication fails

**Solution:**
1. Verify token is being saved: `await _storage.read(key: 'access_token')`
2. Check Bearer token format: `Bearer YOUR_TOKEN`
3. Verify token is not expired

### Issue: GraphQL errors

**Solution:**
1. Check network connectivity
2. Verify GraphQL endpoint URL
3. Test query/mutation in GraphQL Playground first
4. Check for proper query syntax

## Security Best Practices

1. **Use HTTPS in Production** - Never use HTTP in production
2. **Secure Token Storage** - Use `flutter_secure_storage` for tokens
3. **Token Refresh** - Implement refresh token mechanism
4. **Certificate Pinning** - Consider SSL pinning for sensitive apps
5. **API Rate Limiting** - Already implemented with throttler ✅
6. **Input Validation** - Always validate user input
7. **Error Handling** - Don't expose sensitive error details to users

## Additional Features

### File Upload (Images, CVs)

The backend supports base64 file uploads. Example:

```dart
Future<void> uploadCV(String filePath) async {
  final bytes = await File(filePath).readAsBytes();
  final base64File = base64Encode(bytes);
  
  const String mutation = r'''
    mutation UploadCV($input: CreateCandidateProfileInput!) {
      createCandidateProfile(input: $input) {
        id
        cv {
          id
          fileUrl
        }
      }
    }
  ''';
  
  final result = await client.mutate(
    MutationOptions(
      document: gql(mutation),
      variables: {
        'input': {
          'cv': base64File,
          // ... other fields
        },
      },
    ),
  );
}
```

### Real-time Updates (Subscriptions)

For real-time features like notifications:

```dart
// Configure WebSocket link
final WebSocketLink wsLink = WebSocketLink(
  'ws://YOUR_SERVER_IP:4005/api/graphql',
  config: SocketClientConfig(
    autoReconnect: true,
    inactivityTimeout: const Duration(seconds: 30),
  ),
);

// Use subscription
const String notificationSubscription = r'''
  subscription OnNotification {
    notificationReceived {
      id
      title
      message
      type
      createdAt
    }
  }
''';
```

## Support

For issues or questions:
1. Check backend logs: `docker logs rolevate-backend`
2. Test with GraphQL Playground: `http://YOUR_SERVER_IP:4005/api/graphql`
3. Review Flutter debug console
4. Use network inspection tools (Charles Proxy, Proxyman)

---

**Last Updated**: October 26, 2025
