import { useEffect, useRef, useState } from 'react'
import { Toasts, GovPanel, useGov, kindOf } from './gov.jsx'

// Window chrome used by every lab (matches the StatusNeo "sims" pattern)
export function Win({ title, tag = 'Runs in your browser · synthetic data', children, right, dark = false, className = '', gov, govExtra }) {
  // Labs that don't bring their own governance get one that listens to their agent's tool calls
  const own = useGov({ agent: (title || 'agent').split('·')[0].trim().toLowerCase().replace(/\s+/g, '-') + '@1.0' })
  useEffect(() => {
    if (gov) return
    const onTool = (e) => {
      const st = e.detail
      own.tool(st)
      const k = kindOf(st.tool)
      if (k === 'policy') own.emit({ kind: 'policy', t: `Policy gate · ${st.out}`, s: st.in, toast: true, toastKind: /block|never|deny|reject/i.test(st.out) ? 'stop' : /approv|human|hold/i.test(st.out) ? 'human' : 'ok' })
      if (/^(eval|shadow|gate)/.test(st.tool)) own.emit({ kind: 'eval', t: `Eval · ${st.out}`, s: st.in, toast: true, toastKind: 'ok' })
    }
    const onDone = (e) => {
      const steps = e.detail || []
      const pol = [...steps].reverse().find((x) => kindOf(x.tool) === 'policy')
      const last = pol || steps[steps.length - 1]
      if (!last) return
      own.record({ decision: String(last.out).split('→').pop().trim().toUpperCase().slice(0, 48), subject: title, by: /approv|human/i.test(last.out) ? 'pending human approval' : 'agent (policy-bound)' })
      if (/approv|human|supervis/i.test(last.out)) own.emit({ kind: 'human', t: 'Approval requested', s: `${last.out} · evidence attached`, toast: true, toastKind: 'human' })
    }
    window.addEventListener('agent:tool', onTool)
    window.addEventListener('agent:done', onDone)
    return () => { window.removeEventListener('agent:tool', onTool); window.removeEventListener('agent:done', onDone) }
  }, [gov, title])
  const g = gov || own
  return (
    <div className={`win ${dark ? 'dark' : ''} ${className}`}>
      <div className="win-bar">
        <span className="win-dots"><i /><i /><i /></span>
        <b>{title}</b>
        <span className="win-tag"><i className="live" />{tag}</span>
        {right}
      </div>
      <div className="win-body">{children}</div>
      <Toasts gov={g} />
      <GovPanel gov={g} extra={govExtra} />
    </div>
  )
}

export function Pill({ tone = 'ink', children }) {
  return <span className={`pill ${tone}`}>{children}</span>
}

export function Check({ state }) {
  // state: 'wait' | 'run' | 'ok' | 'warn'
  return <span className={`chk ${state}`}>{state === 'ok' ? '✓' : state === 'warn' ? '!' : ''}</span>
}

export function CountUp({ value, format = (v) => Math.round(v).toLocaleString('en-AU'), ms = 900 }) {
  const [v, setV] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const a = from.current, b = value
    let raf, t0
    const tick = (now) => {
      t0 = t0 ?? now
      const u = Math.min(1, (now - t0) / ms)
      const e = 1 - Math.pow(1 - u, 3)
      setV(a + (b - a) * e)
      if (u < 1) raf = requestAnimationFrame(tick)
      else from.current = b
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); from.current = b }
  }, [value, ms])
  return <>{format(v)}</>
}

export function Typer({ text, run = true, speed = 14, onDone }) {
  const [n, setN] = useState(run ? 0 : text.length)
  useEffect(() => {
    if (!run) { setN(text.length); return }
    setN(0)
    let i = 0
    const id = setInterval(() => {
      i += 2
      setN(Math.min(i, text.length))
      if (i >= text.length) { clearInterval(id); onDone && onDone() }
    }, speed)
    return () => clearInterval(id)
  }, [text, run])
  return <>{text.slice(0, n)}{n < text.length && <span className="caret" />}</>
}

// Plays a list of tool-call steps one after another. Calls onStep(i) as each starts and onDone at the end.
export function useTrace(steps, runKey, { onStep, onDone, speed = 1, gov } = {}) {
  const [i, setI] = useState(-1)
  const cb = useRef({ onStep, onDone, gov })
  cb.current = { onStep, onDone, gov }
  useEffect(() => {
    if (!runKey || !steps.length) { setI(-1); return }
    let k = 0, timer
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const next = () => {
      setI(k)
      cb.current.onStep && cb.current.onStep(k)
      const wait = reduce ? 60 : Math.max(260, steps[k].ms * 2.2 * speed)
      timer = setTimeout(() => {
        if (cb.current.gov) cb.current.gov.tool(steps[k])
        else window.dispatchEvent(new CustomEvent('agent:tool', { detail: steps[k] }))
        k++
        if (k < steps.length) next()
        else { setI(steps.length); if (!cb.current.gov) window.dispatchEvent(new CustomEvent('agent:done', { detail: steps })); cb.current.onDone && cb.current.onDone() }
      }, wait)
    }
    next()
    return () => clearTimeout(timer)
  }, [runKey])
  return i
}

export function Trace({ steps, at, title = 'Agent trace' }) {
  const total = steps.slice(0, Math.max(0, at)).reduce((a, s) => a + s.ms, 0)
  return (
    <div className="trace">
      <div className="trace-h"><span>{title}</span><b className="mono">{at >= steps.length ? `${total}ms · ${steps.length} tool calls` : at >= 0 ? 'running…' : 'idle'}</b></div>
      <ol>
        {steps.map((s, k) => {
          const st = at > k ? 'ok' : at === k ? 'run' : 'wait'
          return (
            <li key={k} className={`tr ${st}`}>
              <Check state={st} />
              <div>
                <div className="tr-h"><code>{s.tool}</code><em className="mono">{at > k ? `${s.ms}ms` : ''}</em></div>
                <div className="tr-in">{s.in}</div>
                {at > k && <div className="tr-out">→ {s.out}</div>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function Seg({ value, options, onChange, small }) {
  return (
    <div className={`seg ${small ? 'sm' : ''}`}>
      {options.map((o) => (
        <button key={o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  )
}

export function Slider({ label, value, min, max, step = 1, onChange, fmt = (v) => v, hint }) {
  return (
    <label className="sld">
      <span className="sld-h"><b>{label}</b><em className="mono">{fmt(value)}</em></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
      {hint && <i>{hint}</i>}
    </label>
  )
}
