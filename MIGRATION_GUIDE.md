# Turborepo Migration Guide

## ✅ Completed Setup

### Packages Created
1. **`packages/db`** - Prisma schema and client
2. **`packages/shared`** - Shared types and DTOs

### Current Structure
```
banau/
├── apps/
│   ├── frontend/        ← Your existing TanStack Start app
│   └── backend/         ← Your existing NestJS API
├── packages/
│   ├── db/              ← ✅ Created - Prisma setup
│   └── shared/          ← ✅ Created - Shared types
├── turbo.json           ← ✅ Exists
├── pnpm-workspace.yaml  ← ✅ Exists
└── package.json         ← Root package.json
```

## 📋 Next Steps (Manual)

### Step 1: Install Dependencies

From the root (`/Users/developer/Projects/banau/banau/`):

```bash
cd /Users/developer/Projects/banau/banau
pnpm install
```

### Step 2: Generate Prisma Client

```bash
cd packages/db
pnpm db:generate
```

### Step 3: Update Backend

#### 3.1 Update `apps/backend/package.json`

Add these dependencies:
```json
{
  "dependencies": {
    "@repo/db": "workspace:*",
    "@repo/shared": "workspace:*"
  }
}
```

Remove these (no longer needed):
```json
{
  "dependencies": {
    "@nestjs/swagger": "^11.2.5",  // Remove
    "@prisma/adapter-pg": "^7.3.0",  // Remove  
    "@prisma/client": "^7.3.0",  // Remove - use @repo/db instead
    "pg": "^8.18.0",  // Remove
    "zod": "^4.3.6"  // Remove - use @repo/shared
  }
}
```

#### 3.2 Update Prisma Imports in Backend

**Before:**
```typescript
import { PrismaClient } from '@prisma/client'
```

**After:**
```typescript
import { PrismaClient } from '@repo/db'
```

Files to update:
- `apps/backend/src/prisma/prisma.service.ts`
- Any other files importing from `@prisma/client`

#### 3.3 Update DTO Imports

**Before:**
```typescript
import { CreateUserDto } from './dto/createUser.dto'
```

**After:**
```typescript
import { CreateUserDto } from '@repo/shared'
```

#### 3.4 Remove Swagger/OpenAPI

Delete or comment out in `apps/backend/src/main.ts`:
```typescript
// Remove these lines
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Remove swagger setup
const config = new DocumentBuilder()...
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

Delete files:
- `apps/backend/openapi.json`
- `apps/backend/src/auth/dto/*.dto.ts` (move logic to use @repo/shared)
- `apps/backend/src/website/dto/*.dto.ts`

### Step 4: Update Frontend

#### 4.1 Update `apps/frontend/package.json`

Add:
```json
{
  "dependencies": {
    "@repo/shared": "workspace:*"
  }
}
```

Remove:
```json
{
  "dependencies": {
    "zod": "^3.23.8"  // Remove - use from @repo/shared
  }
}
```

#### 4.2 Update Type Imports

**Before:**
```typescript
import { CreateUserDto, LoginDto } from '@/generated'
```

**After:**
```typescript
import { CreateUserDto, LoginDto, type Website, type User } from '@repo/shared'
```

Files to update:
- `apps/frontend/src/lib/services/auth.services.ts`
- `apps/frontend/src/lib/services/website.service.ts`
- `apps/frontend/src/hooks/use-auth.ts`

Delete:
- `apps/frontend/src/generated.ts` (no longer needed)

### Step 5: Update Root Config

#### 5.1 Create `tsconfig.base.json` in root

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

#### 5.2 Update `turbo.json`

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  }
}
```

### Step 6: Environment Variables

Copy `.env` to `packages/db/`:
```bash
cp apps/backend/.env packages/db/.env
```

### Step 7: Remove Old Prisma from Backend

After confirming everything works:
```bash
rm -rf apps/backend/prisma
rm -rf apps/backend/src/generated
rm apps/backend/prisma.config.ts
```

## 🚀 Running the Monorepo

### Development

```bash
# From root - runs all apps in parallel
pnpm dev

# Or run individually
pnpm --filter @repo/backend dev
pnpm --filter frontend dev
```

### Build

```bash
# Build all packages and apps
pnpm build
```

### Database Commands

```bash
# Generate Prisma client
pnpm --filter @repo/db db:generate

# Push schema to database
pnpm --filter @repo/db db:push

# Run migrations
pnpm --filter @repo/db db:migrate

# Open Prisma Studio
pnpm --filter @repo/db db:studio
```

## 📦 Package Reference

### @repo/db
Provides: `PrismaClient` and all Prisma models

```typescript
import { PrismaClient, User, Website, Token } from '@repo/db'
```

### @repo/shared
Provides: DTOs, types, and validation schemas

```typescript
import {
  // DTOs
  CreateUserDto,
  LoginDto,
  CreateWebsiteDto,
  
  // Types
  User,
  Website,
  ApiResponse,
  
  // Schemas (zod)
  CreateUserDtoSchema,
  LoginDtoSchema,
  CreateWebsiteDtoSchema
} from '@repo/shared'
```

## 🎯 Benefits

1. **Single Source of Truth** - One Prisma schema, shared types
2. **Type Safety** - Frontend and backend use same types
3. **No Code Generation** - No need for swagger/openapi
4. **Fast Builds** - Turbo caches unchanged packages
5. **Easy Deployment** - Each app can be deployed independently

## 🔧 Troubleshooting

### Prisma Client Not Found
```bash
pnpm --filter @repo/db db:generate
```

### Type Errors in Frontend
```bash
pnpm install
pnpm --filter @repo/shared check-types
```

### Monorepo Not Recognizing Packages
```bash
pnpm install --force
```

## ✨ Final Structure

```
banau/
├── apps/
│   ├── frontend/          ← Imports @repo/shared
│   └── backend/           ← Imports @repo/db + @repo/shared
├── packages/
│   ├── db/                ← Single Prisma schema
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── index.ts
│   │       └── generated/  ← Auto-generated
│   └── shared/            ← Shared types & DTOs
│       └── src/
│           ├── types.ts
│           ├── dtos.ts
│           └── index.ts
└── turbo.json
```
