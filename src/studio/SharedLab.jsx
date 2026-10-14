import { useEffect, useMemo, useState } from 'react'
import { Win, Trace, useTrace, Pill, Typer } from './kit.jsx'
import { useGov } from './gov.jsx'
import { DOMAINS, FAULTS, gatewaySteps } from '../data/engine.js'

export default function SharedLab() {
  const gov = useGov({ agent: 'shared-services@1.3', model: 'gpt-4.1 (Azure, AU East)', prompt: 'enterprise v4', policy: 'gateway v10' })
  const [dk, setDk] = useState('fin')
  const [fault, setFault] = useState('none')
  const [run, setRun] = useState(0)
  const [done, setDone] = useState(false)
  const d = DOMAINS.find((x) => x.k === dk)
  const steps = useMemo(() => gatewaySteps(d, fault), [d, fault])
  const at = useTrace(steps, run, {
    gov,
    onDone: () => {
      setDone(true)
      if (fault === 'down') { gov.emit({ kind: 'warn', t: `${d.sys} unavailable · degraded mode`, s: 'queued and told the person, no guess made', toast: true, toastKind: 'warn' }); gov.record({ decision: 'QUEUED · DEGRADED MODE', subject: `${d.t} · ${d.act}`, by: 'gateway (circuit open)' }); return }
      if (fault === 'lost') gov.emit({ kind: 'policy', t: 'Read-back caught a lost write', s: 'retried with the same idempotency key, no duplicate', toast: true, toastKind: 'ok' })
      if (fault === 'slow') gov.emit({ kind: 'info', t: 'Retried with backoff', s: `${d.sys} answered on the second attempt`, toast: true, toastKind: 'ok' })
      gov.record({ decision: d.k === 'proc' ? 'FLAGGED FOR LEGAL' : `${d.act.toUpperCase()} · VERIFIED`, subject: `${d.t} · ${d.sys}`, by: d.k === 'proc' ? 'human-led' : 'agent (within limits)' })
    },
  })
  useEffect(() => { setDone(false); setRun(0) }, [dk, fault])
  const go = () => { setDone(false); setRun((r) => r + 1) }
  const answer = fault === 'down' ? `${d.sys} isn’t responding right now, so I haven’t changed anything. Your request is queued and will run automatically when it’s back. You’ll get a message either way.` : d.result

  return (
    <Win title="Shared-services agent · same gateway, new domain" gov={gov}>
      <div className="sh">
        <div className="lab-ctl">
          <span className="lab">Domain</span>
          <div className="sh-dom">{DOMAINS.map((x) => <button key={x.k} className={dk === x.k ? 'on' : ''} onClick={() => setDk(x.k)}><b>{x.t}</b><span className="mono">{x.sys}</span></button>)}</div>
          <span className="lab">Break the system of record</span>
          <div className="sh-f">{Object.entries(FAULTS).map(([k, f]) => <button key={k} className={`${fault === k ? 'on' : ''} f-${k}`} onClick={() => setFault(k)}><b>{f.t}</b><span>{f.s}</span></button>)}</div>
          <button className="btn-run" onClick={go} disabled={at >= 0 && at < steps.length}>{at >= 0 && at < steps.length ? 'Working…' : 'Ask the agent'}</button>
        </div>
        <div className="lab-mid">
          <div className="sh-chat">
            <div className="sh-msg me"><span className="mono">Staff member · {d.t}</span><p>{d.ask}</p></div>
            {run > 0 && !done && <div className="sh-msg ag typing"><span className="mono">Agent</span><p><i /><i /><i /></p></div>}
            {done && <div className={`sh-msg ag ${fault === 'down' ? 'warn' : ''}`}><span className="mono">Agent · sources cited</span><p><Typer text={answer} speed={10} /></p></div>}
          </div>
          <div className="sh-gw">
            {['Identity', 'Guardrail', d.sys, 'Reason', 'Gate', 'Write', 'Read-back'].map((s, i) => {
              const idx = [0, 1, 2, 4, 5, 6, 7][i]
              const on = at > idx || done
              const bad = (fault === 'down' && i >= 2 && s === d.sys) || (fault === 'lost' && s === 'Read-back')
              const skip = (fault === 'down' && i > 2) || (d.k === 'proc' && (s === 'Write' || s === 'Read-back'))
              return <div key={s} className={`gwn ${on && !skip ? 'on' : ''} ${bad && done ? 'bad' : ''} ${skip ? 'skip' : ''}`}><i className="mono">{i + 1}</i><b>{s}</b></div>
            })}
          </div>
        </div>
        <div className="lab-out">
          <Trace steps={steps} at={at} title="Gateway trace" />
          <div className={`res ${done ? 'in' : ''}`}>
            <div className="res-tier"><Pill tone={!done ? 'soft' : fault === 'down' ? 'warn' : d.k === 'proc' ? 'ink' : 'good'}>{!done ? 'Waiting' : fault === 'down' ? 'Degraded mode' : d.k === 'proc' ? 'Human-led' : 'Done and verified'}</Pill></div>
            <p className="rc-why">The same gateway serves the voice agent, the claims agents and this one: scoped identity, masking at source, circuit breakers, idempotent writes and read-back verification. Moving into a new domain is configuration, not a new platform.</p>
          </div>
        </div>
      </div>
    </Win>
  )
}
