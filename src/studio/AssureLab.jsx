import { useEffect, useMemo, useState } from 'react'
import { Win, Trace, useTrace, Pill, Slider, CountUp } from './kit.jsx'
import { useGov } from './gov.jsx'
import { CALLS, OBLIGATIONS, transcript, assess } from '../data/engine.js'

export default function AssureLab() {
  const gov = useGov({ agent: 'call-assurance@2.2', model: 'claude-sonnet (Bedrock, AU)', prompt: 'obligation v9', policy: 'obligation set 2026.3' })
  const [ck, setCk] = useState('cooling')
  const [run, setRun] = useState(0)
  const [done, setDone] = useState(false)
  const [focus, setFocus] = useState(-1)
  const [rev, setRev] = useState({})
  const [evalN, setEvalN] = useState(1240)
  const [calls, setCalls] = useState(6000)
  const call = CALLS.find((c) => c.k === ck)
  const lines = useMemo(() => transcript(call), [call])
  const res = useMemo(() => assess(call), [call])
  const fails = res.filter((r) => !r.ok)

  const steps = useMemo(() => [
    { tool: 'asr.transcribe', in: 'call audio · AU region', out: `${lines.length} turns · speakers separated`, ms: 900 },
    { tool: 'obligations.load', in: 'obligation set 2026.3', out: `${OBLIGATIONS.length} controls, each versioned`, ms: 20 },
    { tool: 'eval.per_control', in: 'one control at a time, cited line required', out: fails.length ? `${fails.length} not met` : 'all met', ms: 520 },
    { tool: 'policy.route', in: fails.length ? 'possible breach' : 'clean call', out: fails.length ? 'analyst makes the finding' : 'logged, no action', ms: 3 },
    { tool: 'evidence.seal', in: 'transcript, results, versions', out: 'sealed', ms: 10 },
  ], [lines.length, fails.length])

  const at = useTrace(steps, run, {
    gov,
    onDone: () => {
      setDone(true)
      if (fails.length) gov.emit({ kind: 'human', t: `${fails.length} obligation${fails.length > 1 ? 's' : ''} for an analyst`, s: fails.map((f) => f.t).join(' · '), toast: true, toastKind: 'human' })
      else gov.emit({ kind: 'ok', t: 'Every obligation met', s: call.t, toast: true, toastKind: 'ok' })
      gov.record({ decision: fails.length ? 'FOR ANALYST FINDING' : 'CLEAN', subject: call.t, by: fails.length ? 'compliance analyst' : 'agent (assessment only)' })
    },
  })
  useEffect(() => { setDone(false); setRun(0); setRev({}); setFocus(-1) }, [ck])
  const go = () => { setDone(false); setRev({}); setRun((r) => r + 1) }

  const review = (o, agree) => {
    setRev((x) => ({ ...x, [o.k]: agree ? 'agree' : 'override' }))
    gov.approved()
    if (!agree) { setEvalN((n) => n + 1); gov.emit({ kind: 'eval', t: 'Override added to the evaluation set', s: `${o.t} · golden set now ${evalN + 1}`, toast: true, toastKind: 'ok' }) }
    gov.record({ decision: agree ? 'FINDING CONFIRMED' : 'ASSESSMENT OVERRIDDEN', subject: `${call.t} · ${o.t}`, by: 'compliance analyst' })
  }

  const rate = 0.03
  const sample = Math.round(calls * 0.02 * rate)
  const full = Math.round(calls * rate)

  return (
    <Win title="Call assurance · every call, one obligation at a time" gov={gov}>
      <div className="as">
        <div className="lab-ctl">
          <span className="lab">Recorded calls · synthetic</span>
          {CALLS.map((c) => <button key={c.k} className={`rc-chg ${ck === c.k ? 'on' : ''}`} onClick={() => setCk(c.k)}><b>{c.t}</b><span>{c.fails.length ? `${c.fails.length} issue${c.fails.length > 1 ? 's' : ''} hidden in it` : 'Nothing wrong'}</span></button>)}
          <button className="btn-run" onClick={go} disabled={at >= 0 && at < steps.length}>{at >= 0 && at < steps.length ? 'Assessing…' : 'Assess the call'}</button>
          <Trace steps={steps} at={at} title="Agent trace" />
        </div>
        <div className="lab-mid">
          <div className="as-tx">
            <span className="lab">Transcript</span>
            {lines.map(([who, t], i) => {
              const hit = done && res.find((r) => r.line === i)
              return <div key={i} className={`as-l ${who === 'Member' ? 'm' : ''} ${hit ? (hit.ok ? 'ok' : 'no') : ''} ${focus === i ? 'focus' : ''}`}><span className="mono">{String(i + 1).padStart(2, '0')} · {who}</span><p>{t}</p></div>
            })}
          </div>
        </div>
        <div className="lab-out">
          <div className={`res ${done ? 'in' : ''}`}>
            <span className="lab">Obligation set 2026.3 · {OBLIGATIONS.length} controls</span>
            <ul className="as-ob">
              {res.map((o) => (
                <li key={o.k} className={done ? (o.ok ? 'ok' : 'no') : ''} onMouseEnter={() => setFocus(o.line)} onMouseLeave={() => setFocus(-1)}>
                  <i>{done ? (o.ok ? '✓' : '!') : ''}</i>
                  <div><b>{o.t}</b><span>{done ? (o.line >= 0 ? `line ${o.line + 1} · ${o.conf.toFixed(2)}` : o.k === 'vuln' && o.ok ? 'no indicators in this call' : 'not found in the call') : `control ${o.v}`}</span></div>
                  {done && !o.ok && !rev[o.k] && <div className="as-rv"><button onClick={() => review(o, true)}>Confirm</button><button onClick={() => review(o, false)}>Override</button></div>}
                  {rev[o.k] && <em>{rev[o.k] === 'agree' ? 'confirmed' : 'overridden'}</em>}
                </li>
              ))}
            </ul>
            <div className="res-tier"><Pill tone={done ? (fails.length ? 'gold' : 'good') : 'soft'}>{done ? (fails.length ? 'An analyst makes the finding' : 'Clean call, logged') : 'Not assessed'}</Pill><span>golden set {evalN.toLocaleString('en-AU')}</span></div>
          </div>
          <div className="res in">
            <Slider label="Calls a week" value={calls} min={1000} max={30000} step={500} onChange={setCalls} fmt={(v) => v.toLocaleString('en-AU')} hint="Assumes about 3 in 100 calls have an issue worth a finding" />
            <div className="res-kpis">
              <div><b><CountUp value={sample} /></b><span>issues found a week on a 2% sample</span></div>
              <div><b><CountUp value={full} /></b><span>issues found a week reviewing every call</span></div>
            </div>
            <p className="rc-why">In production: 11× more findings against the same control set, time to coaching down from 41 days to 3, and 68% of analyst hours moved to remediation.</p>
          </div>
        </div>
      </div>
    </Win>
  )
}
