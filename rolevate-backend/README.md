# RoleVate Backend

A comprehensive recruitment platform backend built with NestJS, featuring AI-powered job matching, video interviews, and advanced candidate management.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **AI-Powered Job Matching**: Intelligent candidate-job matching using advanced algorithms
- **Video Interviews**: Live video interviewing with LiveKit integration
- **CV Analysis**: Automated CV parsing and analysis with AI insights
- **WhatsApp Integration**: Automated communication with candidates
- **File Management**: Secure file uploads with AWS S3 integration
- **Real-time Notifications**: WebSocket-based notifications system
- **Multi-tenant Architecture**: Company-based user management
- **Advanced Security**: Rate limiting, input validation, and security headers

## 🛠️ Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Caching**: Redis
- **File Storage**: AWS S3
- **Video**: LiveKit
- **AI**: OpenAI GPT integration
- **Validation**: class-validator & class-transformer
- **Testing**: Jest with Supertest

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Redis (for caching)
- AWS S3 bucket (for file storage)
- LiveKit server (for video interviews)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd rolevate-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rolevate"

# JWT
JWT_SECRET="your-super-secure-jwt-secret-here"

# Redis
REDIS_URL="redis://localhost:6379"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

# LiveKit
LIVEKIT_API_KEY="your-livekit-api-key"
LIVEKIT_API_SECRET="your-livekit-api-secret"
LIVEKIT_URL="wss://your-livekit-server.livekit.cloud"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application
NODE_ENV="development"
PORT="4005"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3005"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with demo data
npm run db:seed
```

### 5. Start the application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:4005/api`

## 📖 API Documentation

### Available Endpoints

- **Authentication**: `/api/auth`
  - `POST /login` - User login
  - `POST /signup` - User registration
  - `POST /refresh` - Refresh access token
  - `GET /me` - Get current user profile

- **Companies**: `/api/company`
  - `POST /register` - Register new company
  - `GET /profile` - Get company profile
  - `POST /invitation` - Send company invitation

- **Jobs**: `/api/jobs`
  - `POST /create` - Create new job posting
  - `GET /` - List jobs (with filtering)
  - `PATCH /:id` - Update job
  - `DELETE /:id` - Delete job

- **Applications**: `/api/applications`
  - `POST /` - Submit job application
  - `GET /my-applications` - Get user's applications
  - `PATCH /:id/status` - Update application status

- **Candidates**: `/api/candidate`
  - `POST /profile` - Create/update candidate profile
  - `POST /upload-cv` - Upload CV
  - `GET /saved-jobs` - Get saved jobs

- **Video Interviews**: `/api/interviews`
  - `POST /` - Schedule interview
  - `GET /candidate/:candidateId/job/:jobId` - Get interview details

- **File Uploads**: `/api/uploads`
  - `POST /cvs` - Upload CV files
  - `GET /cvs/:userId/:filename` - Download CV

### API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

## 🗄️ Database Management

```bash
# View database in browser
npm run db:studio

# Reset database (WARNING: deletes all data)
npm run db:reset

# Validate schema
npm run db:validate

# Format schema file
npm run db:format
```

## 🔧 Development Scripts

```bash
# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start in debug mode
npm run start:debug
```

## 🏗️ Project Structure

```
src/
├── app.module.ts          # Main application module
├── main.ts                # Application entry point
├── auth/                  # Authentication module
├── company/               # Company management
├── job/                   # Job postings
├── candidate/             # Candidate profiles
├── application/           # Job applications
├── interview/             # Video interviews
├── communication/         # WhatsApp integration
├── notification/          # Notification system
├── upload/                # File upload handling
├── common/                # Shared utilities
├── config/                # Configuration
└── prisma/                # Database schema
```

## 🔒 Security Features

- **Rate Limiting**: Environment-specific rate limiting (1000 req/hour in production)
- **Input Validation**: Comprehensive DTO validation with class-validator
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable CORS policy
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage

## 📊 Monitoring

The application includes built-in security monitoring:

- **Security Logs**: Track authentication attempts and suspicious activities
- **Rate Limit Monitoring**: Monitor API usage patterns
- **Error Tracking**: Centralized error logging

Access security metrics at `/api/security/metrics`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Follow conventional commit messages

## 📝 License

This project is proprietary and confidential.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the IMPROVEMENT_REPORT.md for known issues and fixes

## 🔄 Recent Updates

- ✅ **Security Hardening**: Implemented environment-specific rate limiting and JWT secret validation
- ✅ **Input Validation**: Added comprehensive DTO validation across all endpoints
- ✅ **Database Seeding**: Created demo data seeding script
- ✅ **Test Coverage**: Improved test coverage with comprehensive unit tests
- ✅ **ESLint Migration**: Updated to ESLint v9 flat config format

See `IMPROVEMENT_REPORT.md` for detailed progress and remaining tasks.</content>
<parameter name="filePath">c:\Users\Al-hu\OneDrive\Desktop\rolevate\rolevate-backend\README.md