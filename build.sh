#!/bin/bash

# Print Node.js and npm versions
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean up any previous build artifacts
rm -rf dist

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Ensure the output directory exists
if [ -d "dist" ]; then
  echo "Build successful! Output in dist/"
  ls -la dist/
else
  echo "Build failed! No dist/ directory found."
  exit 1
fi

# Copy index.html to 404.html for client-side routing
echo "Setting up for client-side routing..."
cp dist/index.html dist/404.html

echo "Build completed successfully!"
