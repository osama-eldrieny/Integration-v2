import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Allows public/*.html pages (e.g. the presentation deck) to be requested
// without the .html extension, e.g. /accelerate-connectors-deck.
function extensionlessHtmlPages(): Plugin {
  const rewrite = (root: string, url: string | undefined) => {
    if (!url || url.includes('.') || url.startsWith('/@') || url.startsWith('/src/')) {
      return url
    }
    const path = url.split('?')[0]
    if (existsSync(join(root, 'public', `${path}.html`))) {
      return `${path}.html${url.slice(path.length)}`
    }
    return url
  }

  return {
    name: 'extensionless-html-pages',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        req.url = rewrite(server.config.root, req.url)
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        req.url = rewrite(server.config.root, req.url)
        next()
      })
    },
  }
}

// Public (GitHub Pages) build: no analytics snippet, no internal decks, and a 404.html that
// serves the app so deep links like /final-solution work on a static host.
function publicBuild(): Plugin {
  return {
    name: 'public-build',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(/<!-- Maze snippet[\s\S]*?<\/script>\s*/, '')
    },
    closeBundle() {
      const dist = join(process.cwd(), 'dist')
      for (const entry of ['landing', 'option-1', 'option-2', 'connection-invalid', '_redirects', 'accelerate-connectors-deck.html', 'connection-invalid-deck.html', 'integrations-v2-alignment-deck.html']) {
        rmSync(join(dist, entry), { recursive: true, force: true })
      }
      copyFileSync(join(dist, 'index.html'), join(dist, '404.html'))
      writeFileSync(join(dist, '.nojekyll'), '')
    },
  }
}

// Dev-only endpoint that lets the "Connection is invalid" deck save the team's answers
// (Detectable today? / V2 or later? / Concerns) to a JSON file in the repo, so they
// survive a refresh and can be committed. Lives outside public/ so saving doesn't
// trigger a page reload.
function deckAnswersApi(): Plugin {
  const route = '/api/deck-answers/connection-invalid'
  return {
    name: 'deck-answers-api',
    configureServer(server) {
      const file = join(server.config.root, 'data', 'connection-invalid-answers.json')
      server.middlewares.use(route, (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method === 'GET') {
          res.end(existsSync(file) ? readFileSync(file, 'utf8') : '{}')
          return
        }
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => (body += chunk))
          req.on('end', () => {
            try {
              const answers = JSON.parse(body)
              mkdirSync(dirname(file), { recursive: true })
              writeFileSync(file, JSON.stringify(answers, null, 2) + '\n')
              res.end(JSON.stringify({ ok: true }))
            } catch {
              res.statusCode = 400
              res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }))
            }
          })
          return
        }
        res.statusCode = 405
        res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }))
      })
    },
  }
}

// https://vite.dev/config/
const publicSite = process.env.VITE_PUBLIC === '1'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), extensionlessHtmlPages(), deckAnswersApi(), ...(publicSite ? [publicBuild()] : [])],
})
