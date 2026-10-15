import { useEffect, useRef, useState } from 'react'
import { createHelixScene } from '../three/helixScene.js'
import { HERO, HELIX, META, STATS } from '../content.js'

export const openLab = (k) => {
  window.dispatchEvent(new CustomEvent('studio:open', { detail: k }))
  document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' })
}

export default function Hero() {
  const host = useRef(null)
  const api = useRef(null)
  const refs = useRef({})
  const [active, setActive] = useState(0)
  const [webgl, setWebgl] = useState(true)

  useEffect(() => {
    let scene
    try {
      scene = createHelixScene(host.current, {
        count: HELIX.length,
        onFrame: ({ active: a, changed, tags, gate, done }) => {
          const W = host.current ? host.current.clientWidth : 0
          Object.entries(tags).forEach(([k, p]) => {
            const el = refs.current[k]
            if (!el) return
            el.style.transform = `translate(${p.x}px, ${p.y}px)`
            el.style.opacity = p.x < 20 || p.x > W - 20 ? 0 : 1
          })
          const c = refs.current.c
          if (c) { c.classList.toggle('gate', gate > 0.5 && done < 0.5); c.classList.toggle('done', done > 0.5) }
          if (changed) setActive(a)
        },
      })
      api.current = scene
    } catch (err) {
      setWebgl(false)
    }
    return () => scene && scene.dispose()
  }, [])

  const H = HELIX[active]
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="hero-tag"><span className="eyebrow">{META.kicker}</span></div>
          <h1>{HERO.line1}<span className="serif">{HERO.line2}</span></h1>
          <p className="hero-lede">{HERO.lede}</p>
          <div className="hero-cta">
            <a href="#studio" className="btn">Open the Agent Studio <span className="mono k">II</span></a>
            <a href="#brief" className="btn ghost">Start with the idea</a>
          </div>
        </div>

        <div className={`hero-stage hx ${webgl ? '' : 'nogl'}`}>
          <div ref={host} className="hero-canvas" />
          <div className="hero-labels" aria-hidden="true">
            <div ref={(el) => (refs.current.c = el)} className="hx-tag c"><span key={`c${active}`}><small className="mono">{H.n} · gate</small>{H.agent}</span></div>
          </div>
          <div className="hx-legend">
            <span className="m"><i />Member journey<em>Marketing &amp; Sales Effectiveness</em></span>
            <span className="e"><i />Enterprise Services<em>Finance, HR, IT, procurement, legal</em></span>
            <span className="a"><i />Agent, behind a gate</span>
          </div>
          <div className="hx-flow" key={active}>
            <div className="m"><span className="lab">Member moment</span><b>{H.m}</b></div>
            <i>→</i>
            <div className="a"><span className="lab">{H.n} · agent behind a gate</span><b>{H.agent}</b></div>
            <i>→</i>
            <div className="e"><span className="lab">Enterprise step</span><b>{H.e}</b></div>
          </div>
          <div className="stage-hint"><b>↻</b>Drag to tilt · click a rung</div>
        </div>
      </div>

      <div className="wrap">
        <div className="hero-status hx-status">
          <div className="hs-live"><i />Live helix</div>
          <div className="hx-steps">
            {HELIX.map((h, i) => (
              <button key={h.k} className={i === active ? 'on' : ''} onClick={() => api.current?.go(i)}><i className="mono">{h.n}</i>{h.m}</button>
            ))}
          </div>
          <div className="hs-cap" key={active}><b>{H.agent}</b><span>{H.s}</span> <button className="lnk" onClick={() => openLab(H.lab)}>Run it →</button></div>
        </div>
        <div className="stats">
          {STATS.map((s) => <div key={s.l}><b>{s.v}</b><span>{s.l}</span><small>{s.s}</small></div>)}
        </div>
        <p className="stats-src mono">StatusNeo production outcomes for a regulated Australian insurer, measured against randomised control or holdout cohorts</p>
      </div>
    </section>
  )
}
