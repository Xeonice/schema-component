#!/bin/bash
set -e

echo "=== Starting build process ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "pnpm version: $(pnpm --version)"

echo ""
echo "=== Installing dependencies ==="
pnpm install --frozen-lockfile

echo ""
echo "=== Building storybook and dependencies ==="
pnpm --filter storybook... run build

echo ""
echo "=== Build complete ==="
echo "Output directory contents:"
ls -la packages/storybook/dist/ | head -20
