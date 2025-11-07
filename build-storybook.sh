#!/bin/bash
set -e

echo "=== Starting build process ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "pnpm version: $(pnpm --version)"

echo ""
echo "=== Verifying dependencies ==="
echo "Checking if node_modules exists..."
ls -d node_modules packages/*/node_modules 2>/dev/null || echo "Some node_modules directories missing"

echo ""
echo "=== Building storybook and dependencies ==="
pnpm --filter storybook... run build

echo ""
echo "=== Build complete ==="
echo "Output directory contents:"
ls -la packages/storybook/dist/ | head -20
