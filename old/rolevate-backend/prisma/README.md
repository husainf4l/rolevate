# Multi-Schema Prisma Setup

This project uses a multi-file approach for better organization of Prisma schemas.

## 🏗️ File Structure

```
prisma/
├── schema.prisma          # 🚫 AUTO-GENERATED - DO NOT EDIT
├── build-schema.js        # Build script
├── README.md             # This file
└── schema/
    ├── base.prisma        # Generator, datasource, and base enums
    ├── user.prisma        # User model and related types
    ├── company.prisma     # Company model
    ├── job.prisma         # Job model
    └── application.prisma # Application model
```

## 🚀 Quick Start

```bash
# Build schema once
npm run schema:build

# Watch for changes and auto-rebuild
npm run schema:watch

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

## 📝 Development Workflow

1. **Edit individual schema files** in `prisma/schema/` directory
2. **Run build script** to generate the combined `schema.prisma`
3. **Use normal Prisma commands** with the generated schema

### Example: Adding a new field

```bash
# 1. Edit the appropriate schema file
vim prisma/schema/user.prisma

# 2. Build the combined schema
npm run schema:build

# 3. Generate migration
npm run db:migrate
```

## 📁 Schema Files

| File | Purpose |
|------|---------|
| `base.prisma` | Generator, datasource, and base enums (UserType) |
| `user.prisma` | User model with all three user types (System, Company, Candidate) |
| `company.prisma` | Company model and related functionality |
| `job.prisma` | Job posting model and JobStatus enum |
| `application.prisma` | Job application model and ApplicationStatus enum |

## 🔧 Available Scripts

```bash
# Schema management
npm run schema:build        # Build combined schema once
npm run schema:watch        # Watch and auto-rebuild on changes

# Database operations (auto-build schema first)
npm run db:generate         # Generate Prisma client
npm run db:migrate          # Run database migrations
npm run db:studio          # Open Prisma Studio
```

## ⚠️ Important Rules

1. **NEVER edit `schema.prisma` directly** - it's auto-generated
2. **Always run the build script** before Prisma operations
3. **Use the npm scripts** - they automatically build the schema first
4. **Keep model dependencies in mind** - referenced models should exist

## 🎯 Benefits

- **Better Organization**: Each domain has its own file
- **Easy Navigation**: Find specific models quickly
- **Maintainable**: Edit one concern at a time
- **Scalable**: Easy to add new schema files
- **Team Friendly**: Reduces merge conflicts

## 📦 Adding New Schema Files

1. Create new `.prisma` file in `schema/` directory
2. Add filename to `schemaFiles` array in `build-schema.js`
3. Run `npm run schema:build` to include it

## 🤝 Git Workflow

The `schema.prisma` file is in `.gitignore` since it's auto-generated. Only commit the individual schema files in the `schema/` directory.
