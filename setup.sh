#!/bin/bash

# Banau Turborepo Setup Script
echo "🚀 Setting up Banau Turborepo..."

# Navigate to root
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd packages/db
cp ../../apps/backend/.env .env 2>/dev/null || echo "Note: Copy .env manually if needed"
pnpm db:generate

# Go back to root
cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review MIGRATION_GUIDE.md for detailed instructions"
echo "2. Update backend imports to use @repo/db and @repo/shared"
echo "3. Update frontend imports to use @repo/shared"
echo "4. Run 'pnpm dev' to start all apps"
echo ""
echo "Commands:"
echo "  pnpm dev              - Start all apps"
echo "  pnpm build            - Build all packages and apps"
echo "  pnpm --filter @repo/db db:studio  - Open Prisma Studio"
echo ""
