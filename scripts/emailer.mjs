// Builds the A4 image emailer: captures live snapshots of the hero and each agent after it runs,
// then renders emailer/emailer.html to emailer/StatusNeo_Medibank_Emailer.png (and a PDF).
// Agent previews are captured at a narrow width so the UI stays legible when scaled into the cards,
// and each one is clipped to the moment its caption describes.
import { preview } from 'vite'
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const server = await preview({ preview: { port: 4185, strictPort: true }, logLevel: 'error' })
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const SNAP = path.resolve('emailer/snaps')
const HIDE = '.hdr, .toasts, .stage-hint { display: none !important; } html { scroll-behavior: auto !important; } .reveal { opacity: 1 !important; transform: none !important; }'

// Screenshot the union of several elements, with a little breathing room
async function clipUnion(p, sels, file, pad = 8) {
  await p.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), sels[0])
  await wait(350)
  const box = await p.evaluate((sels, pad) => {
    const rs = sels.flatMap((s) => [...document.querySelectorAll(s)]).map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0)
    const x = Math.min(...rs.map((r) => r.left)) - pad, y = Math.min(...rs.map((r) => r.top)) - pad
    const w = Math.max(...rs.map((r) => r.right)) + pad - x, h = Math.max(...rs.map((r) => r.bottom)) + pad - y
    return { x: Math.max(0, x + window.scrollX), y: Math.max(0, y + window.scrollY), width: w, height: h }
  }, sels, pad)
  await p.screenshot({ path: file, clip: box, captureBeyondViewport: true })
}

try {
  // hero, desktop width, while the claims rung is active
  const h = await browser.newPage()
  await h.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
  await h.goto('http://localhost:4185/', { waitUntil: 'load' })
  await h.addStyleTag({ content: HIDE })
  await wait(6800)
  await (await h.$('.hero-stage')).screenshot({ path: `${SNAP}/hero.png` })
  await h.close()

  // agents, narrow width
  const p = await browser.newPage()
  await p.setViewport({ width: 420, height: 900, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  await p.goto('http://localhost:4185/', { waitUntil: 'load' })
  await p.addStyleTag({ content: HIDE })
  await wait(1500)
  const labs = [
    { tab: 0, name: 'voice', pick: '.vo-m:nth-child(2)', clip: ['.vo-tx > div:nth-last-child(3)', '.vo-tx > div:nth-last-child(2)', '.vo-xfer'], ms: 8000 },
    { tab: 1, name: 'claims', pick: '.cl-it:nth-child(5)', clip: ['.cl-checks li:nth-child(5)', '.cl-checks li:nth-child(6)', '.cl-checks li:nth-child(7)', '.cl .res-tier'], ms: 7000 },
    { tab: 2, name: 'email', pick: null, clip: ['.em-mail'], ms: 6000 },
    { tab: 3, name: 'assure', pick: '.as .rc-chg:nth-of-type(3)', clip: ['.as-ob li:nth-child(3)', '.as-ob li:nth-child(4)', '.as-ob li:nth-child(5)', '.as-ob li:nth-child(6)'], ms: 6000 },
    { tab: 4, name: 'shared', pick: '.sh-f button.f-lost', clip: ['.sh-msg.ag', '.sh-gw'], ms: 7500 },
  ]
  await p.evaluate(() => document.getElementById('studio').scrollIntoView())
  for (const L of labs) {
    const tabs = await p.$$('.st-tabs button')
    await tabs[L.tab].evaluate((b) => b.click())
    await wait(700)
    if (L.pick) { await p.evaluate((s) => document.querySelector(s)?.click(), L.pick); await wait(400) }
    await p.evaluate(() => document.querySelector('.st-stage .btn-run')?.click())
    await wait(L.ms)
    await clipUnion(p, L.clip, `${SNAP}/${L.name}.png`)
    console.log('snap', L.name)
  }
  await p.close()

  // render the A4 emailer
  const e = await browser.newPage()
  await e.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2.5 })
  await e.goto(pathToFileURL(path.resolve('emailer/emailer.html')).href, { waitUntil: 'networkidle0' })
  await e.evaluateHandle('document.fonts.ready')
  await wait(400)
  await e.screenshot({ path: path.resolve('emailer/StatusNeo_Medibank_Emailer.png'), clip: { x: 0, y: 0, width: 794, height: 1123 } })
  await e.pdf({ path: path.resolve('emailer/StatusNeo_Medibank_Emailer.pdf'), format: 'A4', printBackground: true })
  console.log('emailer rendered')
} finally { await browser.close(); server.httpServer.close() }
