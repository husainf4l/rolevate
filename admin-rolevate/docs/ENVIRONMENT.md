# Environment Configuration

This project uses Angular's environment configuration system to manage different settings for development and production environments.

## Environment Files

- `src/environments/environment.ts` - Development configuration
- `src/environments/environment.prod.ts` - Production configuration
- `src/environments/environment.interface.ts` - TypeScript interface for type safety
- `.env.example` - Example environment variables file

## Configuration Structure

### API Configuration

- `apiUrl`: Base URL for all API calls
- `api.timeout`: Request timeout in milliseconds
- `api.retryAttempts`: Number of retry attempts for failed requests

### Feature Flags

- `features.enableAnalytics`: Enable/disable analytics tracking
- `features.enableDebugMode`: Enable/disable debug features
- `features.enableMockData`: Enable/disable mock data for development

### Logging

- `logging.level`: Log level ('debug', 'info', 'warn', 'error')
- `logging.enableConsoleLogging`: Enable/disable console logging

## Usage in Services

Import and use the environment configuration in your services:

```typescript
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class MyService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getData() {
    return this.http.get(`${this.apiUrl}/data`);
  }
}
```

## Development Setup

1. Copy `.env.example` to `.env.local`
2. Update the values in `.env.local` as needed
3. The development environment will use `environment.ts` automatically

## Production Deployment

1. Update `environment.prod.ts` with your production API URL
2. Ensure `production: true` is set
3. Angular CLI will automatically use the production environment when building with `--configuration=production`

## Build Commands

- Development: `ng serve` (uses `environment.ts`)
- Production: `ng build --configuration=production` (uses `environment.prod.ts`)

## Security Notes

- Never commit sensitive data to environment files
- Use environment variables or Azure Key Vault for production secrets
- The `.env` files are excluded from git via `.gitignore`
