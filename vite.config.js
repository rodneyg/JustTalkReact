import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-api-key',
      writeBundle(options, bundle) {
        Object.keys(bundle).forEach((fileName) => {
          if (fileName.endsWith('.js')) {
            const filePath = path.join(options.dir, fileName)
            let content = fs.readFileSync(filePath, 'utf-8')
            content = content.replace(
              /__OPENAI_API_KEY__/g, 
              process.env.VITE_OPENAI_API_KEY || 'API_KEY_NOT_SET'
            )
            fs.writeFileSync(filePath, content)
          }
        })
      },
    },
  ],
})