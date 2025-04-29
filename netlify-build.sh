#!/bin/bash

# Display versions for debugging
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean install dependencies
npm ci

# Check if vite is available in node_modules
if [ ! -f "./node_modules/.bin/vite" ]; then
  echo "Vite not found in node_modules, installing explicitly"
  npm install vite --no-save
fi

# Run the build with explicit path to vite
./node_modules/.bin/vite build