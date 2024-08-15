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
VITE_OPENAI_API_KEY="$VITE_OPENAI_API_KEY" npm run build

# Log for debugging
echo "Build completed. Checking for API key placeholder in built files:"
grep -r "__OPENAI_API_KEY__" dist && echo "API key placeholder found, replacement failed" || echo "API key placeholder not found, likely replaced successfully"

echo "Checking for 'API_KEY_NOT_SET' in built files:"
grep -r "API_KEY_NOT_SET" dist && echo "'API_KEY_NOT_SET' found, indicating unsuccessful replacement" || echo "'API_KEY_NOT_SET' not found, indicating successful replacement"