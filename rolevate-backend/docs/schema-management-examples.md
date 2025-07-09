// Example: Different database providers based on environment
datasource db {
  provider = env("DATABASE_PROVIDER") // "postgresql" | "mysql" | "sqlite"
  url      = env("DATABASE_URL")
}

// Environment-specific configurations
generator client {
  provider = "prisma-client-js"
  output   = env("PRISMA_CLIENT_OUTPUT") // Default: "./node_modules/.prisma/client"
}

// Prisma Schema Management Best Practices

// 1. Single Schema File (Recommended)
// - Use clear section comments
// - Group related models together
// - Use consistent naming conventions
// - Document complex relationships

// 2. Schema Versioning
// Version: 1.0.0
// Last updated: 2025-01-09
// Breaking changes: None

// 3. Model Organization Pattern
// =======================================
// CORE MODELS (Base entities)
// =======================================

// =======================================
// DOMAIN MODELS (Business logic)
// =======================================

// =======================================
// JUNCTION MODELS (Many-to-many relations)
// =======================================

// =======================================
// AUDIT MODELS (Tracking changes)
// =======================================

// 4. Advanced Schema Features

// Conditional Fields
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  
  // Only for company users
  companyId String?
  company   Company? @relation(fields: [companyId], references: [id])
  
  // Only for candidates
  resume    String?
  skills    String[]
}

// Computed Fields (via Prisma Client Extensions)
// In your service layer
const prisma = new PrismaClient().$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`;
        },
      },
    },
  },
});

// 5. Schema Maintenance Scripts

// Create npm scripts for common tasks:
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio"
  }
}
