# CORS Configuration for RoleVate Backend

The Flutter web application is now connecting to `https://rolevate.com/api/graphql`. To enable proper communication between the frontend and backend, CORS (Cross-Origin Resource Sharing) must be configured on the backend server.

## Issue Detected

Currently, the browser is blocking requests from the Flutter web app with the error:
```
ClientException: Failed to fetch
```

This indicates that the backend is not allowing cross-origin requests from the Flutter app's origin.

## Required CORS Configuration

Add the following CORS configuration to your Apollo GraphQL server:

### For Apollo Server (Node.js/Express)

```javascript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  '/api/graphql',
  cors({
    origin: [
      'http://localhost:*',      // Local development
      'http://127.0.0.1:*',      // Local development alternative
      'https://rolevate.com',    // Production domain
      'https://www.rolevate.com', // Production www domain
      // Add any other origins where your Flutter app will be hosted
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With'
    ],
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      return { token };
    },
  })
);
```

### Alternative: Allow All Origins (Development Only)

For development purposes only, you can allow all origins:

```javascript
app.use(
  '/api/graphql',
  cors({
    origin: true,  // Allows all origins
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server)
);
```

**⚠️ Warning:** Never use `origin: true` in production as it poses security risks.

## Testing CORS Configuration

After configuring CORS, test the connection by:

1. Hot restart the Flutter app:
   ```bash
   flutter run -d chrome
   ```

2. Check the browser console for any CORS errors

3. Verify that GraphQL queries are successfully reaching the backend

## Additional Configuration for Production

### 1. Environment-Based CORS

```javascript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://rolevate.com', 'https://www.rolevate.com']
  : ['http://localhost:*', 'http://127.0.0.1:*'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
```

### 2. Enable Preflight Requests

Ensure OPTIONS requests are handled:

```javascript
app.options('*', cors()); // Enable preflight for all routes
```

### 3. Add Security Headers

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  next();
});
```

## Verification

Once CORS is properly configured, you should see successful GraphQL responses in the Flutter app's console without "Failed to fetch" errors.

## Current App Configuration

The Flutter app is configured to send requests with the following headers:
- `Authorization: Bearer <token>` (when user is authenticated)
- `Content-Type: application/json`

Make sure your CORS configuration allows these headers.
