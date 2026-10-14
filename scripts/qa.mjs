// Screenshots every section at three widths, reports page errors and anything wider than the viewport.
import { preview } from 'vite'
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const only = process.argv[2]
const server = await preview({ preview: { port: 4181, strictPort: true }, logLevel: 'error' })
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const IDS = ['top', 'brief', 'studio', 'framework', 'reuse', 'cases', 'squad', 'ask']
const VIEWS = [['d', 1440, 900, false], ['t', 820, 1180, true], ['m', 390, 844, true]].filter((v) => !only || only.includes(v[0]))
try {
  for (const [tag, w, h, mobile] of VIEWS) {
    fs.mkdirSync(`qa/${tag}`, { recursive: true })
    const p = await browser.newPage()
    const errs = []
    p.on('pageerror', (e) => errs.push(e.message))
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })
    await p.goto('http://localhost:4181/', { waitUntil: 'networkidle0' })
    await wait(3500)
    for (let y = 0; y < 22000; y += 600) { await p.evaluate((y) => window.scrollTo(0, y), y); await wait(40) }
    const over = await p.evaluate(() => {
      const W = document.documentElement.clientWidth
      return { docW: document.documentElement.scrollWidth, W, wide: [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > W + 2 && r.width > 0 && !e.closest('.st-tabs,.il-q,.al-prompts,.tiers,.lane-t,.hero-labels,.globe-box,.comps') }).slice(0, 15).map((e) => e.tagName + '.' + (e.className?.baseVal ?? e.className) + ' ' + Math.round(e.getBoundingClientRect().right)) }
    })
    console.log(tag, JSON.stringify(over))
    for (const [i, id] of IDS.entries()) {
      await p.evaluate((id) => { document.documentElement.style.scrollBehavior = 'auto'; document.getElementById(id).scrollIntoView() }, id)
      await wait(id === 'top' ? 4500 : 2600)
      const el = await p.$('#' + id)
      await el.screenshot({ path: `qa/${tag}/${String(i).padStart(2, '0')}-${id}.png` })
    }
    // click through every lab and capture the governed flows
    await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.getElementById('studio').scrollIntoView() })
    const tabs = await p.$$('.st-tabs button')
    for (let k = 0; k < tabs.length; k++) {
      await tabs[k].click()
      await wait(800)
      const runBtn = await p.$('.st-stage .btn-run')
      if (runBtn) { await runBtn.evaluate((b) => b.scrollIntoView({ block: 'center' })); await runBtn.click() }
      await wait(9000)
      const st = await p.$('.st-stage')
      await st.screenshot({ path: `qa/${tag}/lab-${k + 1}.png` })
    }
    console.log(tag, 'errors', errs.length ? errs.slice(0, 8) : 'none')
    await p.close()
  }
} finally { await browser.close(); server.httpServer.close() }
