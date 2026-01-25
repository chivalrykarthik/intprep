import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom plugin to generate topics.json
const generateTopicsPlugin = (basePath: string) => {
  return {
    name: 'generate-topics',
    buildStart() {
      const prepDir = path.resolve(__dirname, 'public/prep')
      const outputFile = path.resolve(__dirname, 'public/topics.json')

      if (fs.existsSync(prepDir)) {
        const items = fs.readdirSync(prepDir, { withFileTypes: true })
        const topics = items
          .filter(item => item.isDirectory())
          .map(topicDir => {
            const topicPath = path.join(prepDir, topicDir.name)
            const files = fs.readdirSync(topicPath)

            const topicItems = files
              .filter(file => file.endsWith('.md'))
              .map(file => ({
                title: file.replace(/[-_]/g, ' ').replace('.md', '').replace(/\b\w/g, c => c.toUpperCase()),
                // Ensure double slashes doesn't happen if base is just /
                path: `${basePath === '/' ? '' : basePath}/prep/${topicDir.name}/${file}`
              }))

            return {
              id: topicDir.name,
              title: topicDir.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              path: `${basePath === '/' ? '' : basePath}/prep/${topicDir.name}`,
              items: topicItems
            }
          })

        fs.writeFileSync(outputFile, JSON.stringify(topics, null, 2))
        console.log('[generate-topics] topics.json generated')
      }
    },
    handleHotUpdate({ file }: { file: string }) {
      if (file.includes('public/prep')) {
        this.buildStart()
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isProd = command === 'build';
  const base = isProd ? '/intprep/' : '/';

  return {
    base: base,
    plugins: [react(), generateTopicsPlugin(base)],
    server: {
      port: 3000,
    },
  }
})
