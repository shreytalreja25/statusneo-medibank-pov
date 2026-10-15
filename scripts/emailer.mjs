// Builds the A4 image emailer: captures live snapshots of the hero and each agent after it runs,
// then renders emailer/emailer.html to emailer/StatusNeo_Medibank_Emailer.png (and a PDF).
import { preview } from 'vite'
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const server = await preview({ preview: { port: 4185, strictPort: true }, logLevel: 'error' })
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const SNAP = path.resolve('emailer/snaps')

try {
  const p = await browser.newPage()
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
  await p.goto('http://localhost:4185/', { waitUntil: 'load' })
  await p.addStyleTag({ content: '.hdr, .toasts, .stage-hint { display: none !important; } html { scroll-behavior: auto !important; }' })
  // hero at the moment the claims rung is active
  await wait(6800)
  await (await p.$('.hero-stage')).screenshot({ path: `${SNAP}/hero.png` })

  const labs = [
    { tab: 0, sel: '.vo-call', name: 'voice', pick: null },
    { tab: 1, sel: '.cl .lab-out .res', name: 'claims', pick: '.cl-it:nth-child(5)' },
    { tab: 2, sel: '.em-mail', name: 'email', pick: null },
    { tab: 3, sel: '.as .lab-out .res', name: 'assure', pick: '.as .rc-chg:nth-of-type(3)' },
    { tab: 4, sel: '.sh .lab-mid', name: 'shared', pick: '.sh-f button.f-lost' },
  ]
  await p.evaluate(() => document.getElementById('studio').scrollIntoView())
  for (const L of labs) {
    const tabs = await p.$$('.st-tabs button')
    await tabs[L.tab].click()
    await wait(700)
    if (L.pick) { const b = await p.$(L.pick); if (b) { await b.click(); await wait(400) } }
    if (L.name === 'voice') { const b = await p.$('.vo-m:nth-child(2)'); await b.click(); await wait(300) }
    const run = await p.$('.st-stage .btn-run')
    await run.evaluate((b) => b.scrollIntoView({ block: 'center' }))
    await run.click()
    await wait(L.name === 'voice' ? 8000 : 7000)
    const el = await p.$(L.sel)
    await el.evaluate((e) => e.scrollIntoView({ block: 'center' }))
    await wait(300)
    await el.screenshot({ path: `${SNAP}/${L.name}.png` })
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
