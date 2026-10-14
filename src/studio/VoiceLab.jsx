import { useEffect, useMemo, useRef, useState } from 'react'
import { Win, Pill, Slider, CountUp } from './kit.jsx'
import { useGov } from './gov.jsx'
import { CALLBACKS, TOOLS, SCRIPTS, VOICE_KPI, voiceGate } from '../data/engine.js'

export default function VoiceLab() {
  const gov = useGov({ agent: 'callback-voice@3.1', model: 'claude-sonnet (Bedrock, AU)', prompt: 'callback v14', policy: 'conduct v8' })
  const [sel, setSel] = useState('cb1')
  const [phase, setPhase] = useState('idle') // idle | gate | call | done
  const [shown, setShown] = useState(0)
  const [outcome, setOutcome] = useState(null)
  const [vol, setVol] = useState(4000)
  const timers = useRef([])
  const m = CALLBACKS.find((x) => x.id === sel)
  const gate = useMemo(() => voiceGate(m), [m])
  const script = SCRIPTS[m.script] || []
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  useEffect(() => { clear(); setPhase('idle'); setShown(0); setOutcome(null) }, [sel])
  useEffect(() => clear, [])

  const run = () => {
    clear(); setOutcome(null); setShown(0); setPhase('gate')
    gov.tool({ tool: 'queue.next', in: `${m.name} · ${m.reason}`, out: 'eligibility gate', ms: 6 })
    gate.checks.forEach((c, i) => timers.current.push(setTimeout(() => {
      gov.tool({ tool: 'gate.check', in: c.t, out: c.ok ? 'pass' : `fail · ${c.s}`, ms: 4 })
    }, 250 + i * 260)))
    const after = 250 + gate.checks.length * 260 + 200
    if (!gate.pass) {
      timers.current.push(setTimeout(() => {
        setPhase('done'); setOutcome('blocked')
        const why = gate.checks.find((c) => !c.ok)
        gov.emit({ kind: 'policy', t: 'Gate held · never dialled', s: why.t + ': ' + why.s, toast: true, toastKind: 'stop' })
        gov.record({ decision: 'NOT DIALLED', subject: `${m.name} · ${why.t}`, by: 'eligibility gate (deterministic)' })
      }, after))
      return
    }
    timers.current.push(setTimeout(() => { setPhase('call'); gov.tool({ tool: 'dialler.call', in: `${m.name} · window ${m.window}`, out: 'connected · right party confirmed', ms: 1800 }) }, after))
    script.forEach((_, i) => timers.current.push(setTimeout(() => {
      setShown(i + 1)
      const [who, text] = script[i]
      if (who === 'member' && m.script === 'quote' && /cost|price/i.test(text)) {
        gov.emit({ kind: 'policy', t: 'Price asked · tool not provisioned', s: 'quote.price does not exist for this agent', toast: true, toastKind: 'stop' })
      }
      if (who === 'member' && m.script === 'distress') {
        gov.emit({ kind: 'warn', t: 'Distress detected', s: 'warm transfer, no retry', toast: true, toastKind: 'warn' })
      }
    }, after + 700 + i * 1500)))
    timers.current.push(setTimeout(() => {
      setPhase('done')
      const o = m.script === 'standard' ? 'resolved' : 'transfer'
      setOutcome(o)
      gov.tool({ tool: 'llm.converse', in: `${script.length} turns · conduct policy every turn`, out: o === 'resolved' ? 'goal met' : 'handover required', ms: 1400 })
      if (o === 'resolved') { gov.tool({ tool: 'requirements.send_link', in: 'health declaration', out: 'SMS sent', ms: 120 }); gov.record({ decision: 'RESOLVED · LINK SENT', subject: m.name, by: 'agent (callback-only)' }) }
      else { gov.tool({ tool: 'transfer.warm', in: m.script === 'quote' ? 'licensed consultant' : 'member care team', out: 'context handed over', ms: 900 }); gov.record({ decision: 'WARM TRANSFER', subject: `${m.name} · ${m.script === 'quote' ? 'price question' : 'distress'}`, by: 'conduct policy (no retry)' }) }
    }, after + 700 + script.length * 1500 + 300))
  }

  const saving = Math.round(vol * 52 * (VOICE_KPI.control.cost - VOICE_KPI.agent.cost))
  const busy = phase === 'gate' || phase === 'call'

  return (
    <Win title="Callback voice agent · only calls people who asked" gov={gov}>
      <div className="vo">
        <div className="lab-ctl">
          <span className="lab">Callback queue · today</span>
          <div className="vo-q">
            {CALLBACKS.map((c) => {
              const g = voiceGate(c)
              return (
                <button key={c.id} className={`vo-m ${sel === c.id ? 'on' : ''}`} onClick={() => setSel(c.id)}>
                  <b>{c.name}</b><span>{c.reason}</span>
                  <em className={g.pass ? '' : 'x'}>{c.requested ? `Requested ${c.window}` : 'No callback requested'}</em>
                </button>
              )
            })}
          </div>
          <button className="btn-run" onClick={run} disabled={busy}>{busy ? (phase === 'gate' ? 'Checking the gate…' : 'On the call…') : outcome ? 'Run again' : 'Place the call'}</button>
        </div>

        <div className="lab-mid">
          <div className="vo-gate">
            <div className="rc-map-h"><span className="lab">Call eligibility gate · evaluated before the dialler fires</span>{phase !== 'idle' && <Pill tone={gate.pass ? 'good' : 'stop'}>{gate.pass ? 'Pass' : 'Held'}</Pill>}</div>
            <ul>
              {gate.checks.map((c, i) => (
                <li key={c.t} className={phase === 'idle' ? '' : c.ok ? 'ok' : 'no'} style={{ transitionDelay: `${i * 260}ms` }}>
                  <i>{phase === 'idle' ? '' : c.ok ? '✓' : '×'}</i><b>{c.t}</b><span>{c.s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="vo-call">
            <div className="vo-call-h">
              <span className={`vo-live ${phase === 'call' ? 'on' : ''}`}><i />{phase === 'call' ? 'Live call' : phase === 'done' ? 'Call ended' : 'Idle'}</span>
              <div className={`vo-wave ${phase === 'call' ? 'on' : ''}`}>{Array.from({ length: 28 }).map((_, i) => <i key={i} style={{ animationDelay: `${(i % 7) * 0.09}s` }} />)}</div>
            </div>
            <div className="vo-tx">
              {outcome === 'blocked' && <div className="vo-block"><b>Never dialled.</b> The member did not ask for this call, or the gate found a reason not to make it. There is no path in the system that calls anyway.</div>}
              {script.slice(0, shown).map(([who, text], i) => (
                <div key={i} className={`vo-line ${who}`}><span className="mono">{who === 'agent' ? 'Aria · agent' : `${m.name} · member`}</span><p>{text}</p></div>
              ))}
              {phase === 'idle' && <p className="rc-clean muted">Place the call to see the gate, then the conversation.</p>}
              {outcome === 'transfer' && <div className="vo-xfer">Warm transfer to {m.script === 'quote' ? 'a licensed consultant' : 'the member care team'}, with the context attached. No retry.</div>}
              {outcome === 'resolved' && <div className="vo-ok">Resolved on the call. Secure link sent, application unblocked.</div>}
            </div>
          </div>
        </div>

        <div className="lab-out">
          <div className="res in">
            <span className="lab">Tools this agent holds</span>
            <div className="vo-tools">{TOOLS.map((t) => <span key={t.t} className={t.on ? '' : 'off'}><code>{t.t}</code>{t.on ? 'provisioned' : 'does not exist'}</span>)}</div>
            <p className="rc-why">Anti-hawking is structural. The agent cannot make an offer because the capability is absent, not discouraged.</p>
          </div>
          <div className="res in vo-kpi">
            <span className="lab">Against a human-dialled control · 12 weeks</span>
            <div className="vo-bars">
              <div><span>Right-party contact</span><i><em style={{ width: `${VOICE_KPI.control.rpc * 2}%` }} /></i><b>{VOICE_KPI.control.rpc}%</b></div>
              <div className="ag"><span>With the agent</span><i><em style={{ width: `${VOICE_KPI.agent.rpc * 2}%` }} /></i><b>{VOICE_KPI.agent.rpc}%</b></div>
              <div><span>Cost per contact</span><i><em style={{ width: `${VOICE_KPI.control.cost * 6}%` }} /></i><b>${VOICE_KPI.control.cost.toFixed(2)}</b></div>
              <div className="ag"><span>With the agent</span><i><em style={{ width: `${VOICE_KPI.agent.cost * 6}%` }} /></i><b>${VOICE_KPI.agent.cost.toFixed(2)}</b></div>
            </div>
            <Slider label="Callbacks a week" value={vol} min={500} max={20000} step={500} onChange={setVol} fmt={(v) => v.toLocaleString('en-AU')} />
            <div className="vo-save"><b><CountUp value={saving} format={(x) => `$${(x / 1e6).toFixed(1)}M`} /></b><span>a year in contact cost at this volume, before any uplift from reaching more members</span></div>
          </div>
        </div>
      </div>
    </Win>
  )
}
