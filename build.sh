#!/bin/bash

# Vercel Build Script for Monorepo
echo "🚀 Starting monorepo build..."

# Install root dependencies (workspace setup)
echo "📦 Installing root dependencies..."
npm install

# Navigate to web app
cd apps/web

# Install web app dependencies
echo "📦 Installing web app dependencies..."
npm install

# Build Next.js app
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build complete!"
