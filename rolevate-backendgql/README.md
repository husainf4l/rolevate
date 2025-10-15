# RoleVate GraphQL API

A high-performance GraphQL API for the RoleVate platform - a Google Jobs-like application with AI-powered interviews, built with NestJS, Fastify, and PostgreSQL.

## 🚀 Features

- **⚡ High Performance**: Built with Fastify instead of Express for better performance
- **🔐 Dual Authentication**: JWT (HTTP-only cookies) + API Key authentication
- **📊 GraphQL API**: Code-first GraphQL with Apollo Server
- **🗄️ Database**: PostgreSQL with TypeORM
- **✅ Validation**: Input validation with class-validator
- **🏗️ Best Practices**: Clean architecture with Entities, DTOs, and Services
- **🔒 Security**: Password hashing, secure cookies, input sanitization

## 🏗️ Architecture

### Clean Architecture Pattern
```
src/
├── auth/                    # Authentication module
│   ├── api-key.guard.ts    # API key authentication guard
│   ├── auth.module.ts      # Authentication module
│   ├── auth.resolver.ts    # GraphQL auth resolver
│   ├── auth.service.ts     # Authentication business logic
│   ├── jwt-auth.guard.ts   # JWT authentication guard
│   ├── login.input.ts      # Login input DTO
│   └── login-response.dto.ts # Login response DTO
├── notification/               # Notification system module
│   ├── create-notification.input.ts # Notification creation input DTO
│   ├── notification.dto.ts       # Notification response DTO
│   ├── notification.entity.ts    # Notification database entity
│   ├── notification.module.ts    # Notification module
│   ├── notification.resolver.ts  # GraphQL notification resolver
│   └── notification.service.ts   # Notification business logic
├── app.module.ts           # Main application module
└── main.ts                 # Application entry point
```

### Design Patterns Implemented
- **Repository Pattern**: TypeORM repositories for data access
- **DTO Pattern**: Separation of API contracts from database entities
- **Guard Pattern**: Authentication and authorization guards
- **Service Layer**: Business logic separation
- **Module Pattern**: Feature-based modular architecture

## 🛠️ Technology Stack

- **Framework**: NestJS with Fastify
- **GraphQL**: Apollo Server with code-first approach
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + API Keys
- **Validation**: class-validator + class-transformer
- **Password Hashing**: bcrypt
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd rolevate-backendgql
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_HOST=your-postgres-host
DATABASE_PORT=5432
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
DATABASE_NAME=your-database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Database Setup

Ensure PostgreSQL is running and the database exists. The application will automatically create tables with `synchronize: true`.

### 4. Run the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The GraphQL API will be available at `http://localhost:4005/graphql`

## 📊 GraphQL API Documentation

### Authentication

The API supports two authentication methods:

#### 1. JWT Authentication (HTTP-only Cookies)
- Login returns a JWT token stored in HTTP-only cookies
- Subsequent requests automatically include the cookie
- More secure for web applications

#### 2. API Key Authentication
- Pass `x-api-key: your-api-key-here` header
- Suitable for server-to-server communication

### GraphQL Schema

#### Enums
```graphql
enum UserRole {
  CANDIDATE
  BUSINESS
}

enum NotificationType {
  JOB_APPLICATION
  JOB_UPDATE
  SYSTEM
  MARKETING
}
```

#### Types
```graphql
type UserDto {
  id: Int!
  email: String!
  role: UserRole!
  name: String
}

type JobDto {
  id: Int!
  title: String!
  description: String!
  company: String!
  location: String!
  salary: Float
  postedBy: UserDto!
  createdAt: DateTime!
}

type ApiKeyDto {
  id: Int!
  key: String!
  name: String
  isActive: Boolean!
  createdAt: DateTime!
  userId: Int!
}

type NotificationDto {
  id: Int!
  title: String!
  message: String!
  type: NotificationType!
  isRead: Boolean!
  createdAt: DateTime!
  readAt: DateTime
  userId: Int!
  metadata: JSON
}

type LoginResponseDto {
  access_token: String!
  user: UserDto!
}
```

#### Inputs
```graphql
input CreateUserInput {
  email: String!
  password: String!
  role: UserRole!
  name: String
}

input CreateJobInput {
  title: String!
  description: String!
  company: String!
  location: String!
  salary: Float
  postedById: Int!
}

input CreateApiKeyInput {
  name: String
}

input CreateNotificationInput {
  title: String!
  message: String!
  type: NotificationType!
  userId: Int!
  metadata: JSON
}

input UpdateUserInput {
  role: UserRole
  name: String
}

input LoginInput {
  email: String!
  password: String!
}
```

### Queries

#### Get All Users (JWT Required)
```graphql
query {
  users {
    id
    email
    role
    name
  }
}
```

#### Get User by ID (API Key Required)
```graphql
query {
  user(id: 1) {
    id
    email
    role
    name
  }
}
```

#### Get All Jobs (Public)
```graphql
query {
  jobs {
    id
    title
    description
    company
    location
    salary
    postedBy {
      id
      email
      role
      name
    }
    createdAt
  }
}
```

#### Get Job by ID (API Key Required)
```graphql
query {
  job(id: 1) {
    id
    title
    description
    company
    location
    salary
    postedBy {
      id
      email
      role
      name
    }
    createdAt
  }
}
```

#### Get My API Keys (JWT Required)
```graphql
query {
  myApiKeys {
    id
    key
    name
    isActive
    createdAt
    userId
  }
}
```

#### Get My Notifications (JWT Required)
```graphql
query {
  myNotifications(limit: 20, offset: 0, unreadOnly: false) {
    notifications {
      id
      title
      message
      type
      isRead
      createdAt
      readAt
      userId
      metadata
    }
    total
  }
}
```

#### Get Unread Notification Count (JWT Required)
```graphql
query {
  unreadNotificationCount
}
```

### Mutations

#### Create User (Public)
```graphql
mutation {
  createUser(input: {
    email: "user@example.com"
    password: "securepassword"
    role: CANDIDATE
    name: "John Doe"
  }) {
    id
    email
    role
    name
  }
}
```

#### Login (Public)
```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "securepassword"
  }) {
    access_token
    user {
      id
      email
      role
      name
    }
  }
}
```

#### Create Job (JWT Required)
```graphql
mutation {
  createJob(input: {
    title: "Software Engineer"
    description: "Develop amazing software"
    company: "Tech Corp"
    location: "Remote"
    salary: 100000
    postedById: 1
  }) {
    id
    title
    description
    company
    location
    salary
    postedBy {
      id
      email
      role
      name
    }
    createdAt
  }
}
```

#### Generate API Key (JWT Required)
```graphql
mutation {
  generateApiKey(input: {
    name: "My API Key"
  }) {
    id
    key
    name
    isActive
    createdAt
    userId
  }
}
```

#### Revoke API Key (JWT Required)
```graphql
mutation {
  revokeApiKey(keyId: 1)
}
```

#### Create Notification (JWT Required)
```graphql
mutation {
  createNotification(input: {
    title: "Welcome!"
    message: "Welcome to our platform"
    type: SYSTEM
    userId: 1
    metadata: { "source": "registration" }
  }) {
    id
    title
    message
    type
    isRead
    createdAt
    userId
    metadata
  }
}
```

#### Mark Notification as Read (JWT Required)
```graphql
mutation {
  markNotificationAsRead(notificationId: 1)
}
```

#### Mark All Notifications as Read (JWT Required)
```graphql
mutation {
  markAllNotificationsAsRead
}
```

#### Delete Notification (JWT Required)
```graphql
mutation {
  deleteNotification(notificationId: 1)
}
```

## 🔧 Configuration

### GraphQL Configuration
Located in `src/app.module.ts`:

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,        // Auto-generate schema
  playground: true,            // Enable GraphQL Playground
  context: ({ req, reply }) => ({ req, reply }), // Fastify context
})
```

### Database Configuration
Located in `src/app.module.ts`:

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT') || 5432,
    username: configService.get('DATABASE_USERNAME'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true, // Auto-create tables (disable in production)
  }),
  inject: [ConfigService],
})
```

## 🧪 Testing the API

### Using GraphQL Playground
1. Visit `http://localhost:4005/graphql`
2. Use the interactive playground to test queries and mutations

### Using cURL

#### Create a User
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createUser(input: { email: \"test@example.com\", password: \"password123\", role: CANDIDATE, name: \"Test User\" }) { id email role name } }"
  }'
```

#### Login
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: { email: \"test@example.com\", password: \"password123\" }) { access_token user { id email role name } } }"
  }'
```

#### Get Users (with JWT cookie)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{ "query": "{ users { id email role name } }" }'
```

#### Get User by ID (with API key)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{ "query": "{ user(id: 1) { id email role name } }" }'
```

#### Get All Jobs
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -d '{ "query": "{ jobs { id title description company location salary postedBy { id email role name } createdAt } }" }'
```

#### Get Job by ID (with API key)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{ "query": "{ job(id: 1) { id title description company location salary postedBy { id email role name } createdAt } }" }'
```

#### Create Job (with JWT cookie)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation { createJob(input: { title: \"Software Engineer\", description: \"Develop software\", company: \"Tech Corp\", location: \"Remote\", salary: 100000, postedById: 1 }) { id title description company location salary postedBy { id email role name } createdAt } }"
  }'
```

#### Generate API Key (with JWT cookie)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation { generateApiKey(input: { name: \"My Key\" }) { id key name isActive createdAt userId } }"
  }'
```

#### Get My API Keys (with JWT cookie)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{ "query": "{ myApiKeys { id key name isActive createdAt userId } }" }'
```

#### Revoke API Key (with JWT cookie)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{ "query": "mutation { revokeApiKey(keyId: 1) }" }'
```

#### Get My Notifications (with JWT cookie)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{ "query": "{ myNotifications(limit: 10, unreadOnly: false) { notifications { id title message type isRead createdAt } total } }" }'
```

#### Get Unread Notification Count (with JWT cookie)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{ "query": "{ unreadNotificationCount }" }'
```

#### Mark Notification as Read (with JWT cookie)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{ "query": "mutation { markNotificationAsRead(notificationId: 1) }" }'
```

#### Create Notification (with JWT cookie)
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation { createNotification(input: { title: \"Test\", message: \"Test message\", type: SYSTEM, userId: 1 }) { id title message type isRead createdAt } }"
  }'
```

## 🔒 Security Features

### ISO 27001 Compliance Features

- **Authentication & Authorization**: JWT tokens with HTTP-only cookies, API key authentication
- **Password Security**: bcrypt hashing, strong password policies (8+ chars, mixed case, numbers, special chars)
- **Input Validation**: Comprehensive validation with class-validator
- **Rate Limiting**: Throttling to prevent abuse (10 requests/minute)
- **Security Headers**: Helmet.js for XSS protection, CSP, HSTS
- **CORS Configuration**: Restricted origins, credentials handling
- **API Key Management**: User-controlled API keys with expiration (1 year)
- **Audit Logging**: Comprehensive logging of security events
- **Error Handling**: Sanitized error responses, no sensitive data leakage
- **Data Protection**: SQL injection prevention via TypeORM, secure defaults

### Security Best Practices Implemented

- **Principle of Least Privilege**: Scoped API keys and role-based access
- **Defense in Depth**: Multiple security layers (validation, auth, rate limiting)
- **Secure Defaults**: HTTPS enforcement, secure headers, no default credentials
- **Logging & Monitoring**: Audit trails for compliance and incident response
- **Input Sanitization**: Automatic validation and sanitization of all inputs

### Production Security Checklist

- [ ] Set strong `JWT_SECRET` and database credentials
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Enable HTTPS/TLS
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper logging destination
- [ ] Regular security updates and dependency scanning
- [ ] Database encryption at rest
- [ ] Backup and disaster recovery procedures
- **Security Headers**: Helmet middleware for CSP, HSTS, etc.
- **CORS Configuration**: Restricted origins and methods
- **API Key Management**: User-controlled API keys with expiration
- **Audit Logging**: Security events logged for monitoring
- **Error Handling**: Global filter prevents information leakage

## 🛡️ ISO 27001 Compliance

This API implements security controls aligned with ISO 27001 requirements:

### A.9 Access Control
- ✅ Role-based access control (CANDIDATE/BUSINESS)
- ✅ JWT authentication with secure cookies
- ✅ API key authentication with expiration
- ✅ User access provisioning and revocation

### A.10 Cryptography
- ✅ Password hashing with bcrypt
- ✅ Secure random API key generation
- ✅ HTTPS enforcement (configure in production)

### A.12 Operations Security
- ✅ Audit logging for authentication and API key events
- ✅ Secure error handling without information disclosure
- ✅ Input validation and sanitization

### A.13 Communications Security
- ✅ CORS configuration for allowed origins
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Credential protection in transit

### A.14 System Acquisition, Development and Maintenance
- ✅ Secure coding practices
- ✅ Input validation
- ✅ Dependency management

### Additional Controls
- ✅ Rate limiting to prevent abuse
- ✅ Password complexity requirements
- ✅ API key rotation capabilities
- ✅ Data minimization in responses

## 📦 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger

# Production
npm run build             # Build for production
npm run start:prod        # Start production build

# Testing
npm run test              # Run unit tests
npm run test:e2e          # Run e2e tests
npm run test:cov          # Run tests with coverage

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `synchronize: false` in database config
- [ ] Use proper migrations for database schema changes
- [ ] Set strong `JWT_SECRET`
- [ ] Configure CORS with allowed origins only
- [ ] Enable HTTPS/TLS
- [ ] Set up proper logging (not console)
- [ ] Configure rate limiting based on needs
- [ ] Regular security audits and updates
- [ ] Backup and recovery procedures
- [ ] Monitor audit logs for suspicious activity

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4005
CMD ["npm", "run", "start:prod"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**RoleVate** - Connecting talent with opportunities through AI-powered interviews.
