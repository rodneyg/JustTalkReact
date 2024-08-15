#!/bin/bash

# Store the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Navigate to the project root
cd "$PROJECT_ROOT"

# Ensure the API key is available
if [ -z "$VITE_OPENAI_API_KEY" ]; then
  echo "Error: VITE_OPENAI_API_KEY is not set"
  exit 1
fi

# Build the project
npm run build

echo "Build completed. Starting preview server..."

# Start the preview server
npm run preview