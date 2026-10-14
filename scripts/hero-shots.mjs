// Captures the hero at several moments of the loop (desktop and mobile).
import { preview } from 'vite'
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const server = await preview({ preview: { port: 4183, strictPort: true }, logLevel: 'error' })
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
fs.mkdirSync('qa/hero', { recursive: true })
for (const [tag, w, h, m] of [['d', 1440, 900, false], ['m', 390, 844, true]]) {
  const p = await browser.newPage()
  await p.setViewport({ width: w, height: h, isMobile: m, hasTouch: m })
  await p.goto('http://localhost:4183/', { waitUntil: 'load' })
  const t0 = Date.now()
  for (const t of [2.5, 6.5, 9.5, 13.8]) {
    const wait = t * 1000 - (Date.now() - t0)
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))
    await p.screenshot({ path: `qa/hero/${tag}-${t}.png` })
  }
  await p.close()
}
await browser.close(); server.httpServer.close()
