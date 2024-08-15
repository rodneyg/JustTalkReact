#!/bin/bash

# Navigate to the project root
cd ..

# Build the project
npm run build

# Replace the API key placeholder in the built files
find dist -type f -name "*.js" -exec sed -i 's/__OPENAI_API_KEY__/'"$VITE_OPENAI_API_KEY"'/g' {} +