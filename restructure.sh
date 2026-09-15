#!/bin/bash
set -e

echo "Creating directories..."
mkdir -p frontend backend

echo "Moving backend files..."
mv api server prisma prisma.config.ts backend/ || true

echo "Moving frontend files..."
mv src public components.json frontend/ || true

echo "Updating tsconfig.json..."
sed -i '' 's/"\.\/src\/\*"/"\.\/frontend\/src\/\*"/g' tsconfig.json

echo "Updating package.json scripts..."
sed -i '' 's/"tsx api\/index.ts"/"tsx backend\/api\/index.ts"/g' package.json
sed -i '' 's/vite build --ssr src\/entry.server.tsx/vite build --ssr frontend\/src\/entry.server.tsx/g' package.json
sed -i '' 's/"tsx prisma\/scripts\/auto-seed.ts"/"tsx backend\/prisma\/scripts\/auto-seed.ts"/g' package.json
sed -i '' 's/"src\/\*\*\/\*\.{ts,tsx,css,json}"/"frontend\/src\/\*\*\/\*\.{ts,tsx,css,json}"/g' package.json

echo "Updating index.html..."
sed -i '' 's/\/src\//\/frontend\/src\//g' index.html

echo "Updating vite.config.ts..."
sed -i '' 's/path.resolve(__dirname, "\.\/src")/path.resolve(__dirname, "\.\/frontend\/src")/g' vite.config.ts

echo "Done."
