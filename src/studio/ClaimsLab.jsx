import { useEffect, useMemo, useState } from 'react'
import { Win, Trace, useTrace, Pill, Slider } from './kit.jsx'
import { useGov, Approval } from './gov.jsx'
import { DOCS, POLICY, verify, claimsReplay, money, hashStr } from '../data/engine.js'

function DocCard({ d, scanning }) {
  return (
    <div className={`cl-doc ${d.flags.blurry ? 'blur' : ''} ${scanning ? 'scan' : ''}`}>
      <div className="cl-doc-h"><b>{d.t}</b><span className="mono">{d.fields.date}</span></div>
      <div className="cl-doc-b">
        <span>{d.fields.provider.replace(/ \(.*\)/, '')}</span>
        <span className="mono">{d.fields.item}</span>
        <div className="cl-doc-l"><i /><i /><i style={{ width: '60%' }} /></div>
        <b className="mono">Total {money(d.fields.fee)}</b>
      </div>
      {scanning && <div className="cl-scan" />}
    </div>
  )
}

export default function ClaimsLab() {
  const gov = useGov({ agent: 'claims-intake@2.4', model: 'claude-sonnet (Bedrock, AU)', prompt: 'classify v9 · sop v12', policy: 'claims v6' })
  const [k, setK] = useState('dental')
  const [th, setTh] = useState(0.85)
  const [run, setRun] = useState(0)
  const [done, setDone] = useState(false)
  const [appr, setAppr] = useState('pending')
  const d = DOCS.find((x) => x.k === k)
  const v = useMemo(() => verify(d, th), [d, th])
  const rep = useMemo(() => claimsReplay(th), [th])

  const steps = useMemo(() => [
    { tool: 'intake.receive', in: `${d.t} · uploaded in the app`, out: 'image + PDF text layer', ms: 20 },
    { tool: 'llm.classify', in: 'multimodal, no separate OCR stage', out: `${d.kind} · confidence ${d.conf.toFixed(2)}`, ms: 640 },
    { tool: 'llm.extract', in: 'provider, item, date, fee', out: `${d.fields.item} · ${money(d.fields.fee)}`, ms: 380 },
    { tool: 'policy.read', in: `${POLICY.id} · read-only`, out: `${POLICY.hospital} + ${POLICY.extras}`, ms: 70 },
    { tool: 'sop.verify', in: '7 clauses and steps, one at a time', out: v.failed.length ? `${v.failed.length} not met` : 'all met', ms: 160 },
    { tool: 'policy.route', in: `confidence ${d.conf.toFixed(2)} vs threshold ${th.toFixed(2)}`, out: v.route.toLowerCase(), ms: 3 },
    ...(v.stp ? [{ tool: 'claims.write', in: `benefit ${money(v.benefit)} · idempotent`, out: 'written · read-back matches', ms: 110 }] : []),
    { tool: 'evidence.seal', in: 'document, fields, clause results', out: `case ${hashStr(d.k + th)}`, ms: 12 },
  ], [d, th, v])

  const at = useTrace(steps, run, {
    gov,
    onDone: () => {
      setDone(true)
      if (v.stp) {
        gov.emit({ kind: 'ok', t: `Paid straight through · ${money(v.benefit)}`, s: `${d.t} · every clause met`, toast: true, toastKind: 'ok' })
        gov.record({ decision: `PAID ${money(v.benefit)}`, subject: `${d.t} · ${POLICY.id}`, by: 'agent (above threshold, all clauses met)' })
      } else {
        gov.emit({ kind: 'human', t: v.route, s: v.failed.map((c) => c.t).join(' · ') || `confidence ${d.conf.toFixed(2)} below ${th.toFixed(2)}`, toast: true, toastKind: 'human' })
        gov.record({ decision: v.route.toUpperCase(), subject: `${d.t} · ${POLICY.id}`, by: 'claims handler' })
      }
    },
  })
  useEffect(() => { setDone(false); setRun(0); setAppr('pending') }, [k, th])
  const go = () => { setDone(false); setAppr('pending'); setRun((r) => r + 1) }
  const scanning = at >= 0 && at < 3

  return (
    <Win title="Claims intake · classify the document, then verify the SOP" gov={gov}>
      <div className="cl">
        <div className="lab-ctl">
          <span className="lab">Documents arriving</span>
          <div className="cl-list">
            {DOCS.map((x) => (
              <button key={x.k} className={`cl-it ${k === x.k ? 'on' : ''}`} onClick={() => setK(x.k)}>
                <i className="mono">{x.icon}</i><b>{x.t}</b><span>{x.kind} · {money(x.fields.fee)}</span>
              </button>
            ))}
          </div>
          <div className="cl-pol">
            <span className="lab">Member policy · synthetic</span>
            <b>{POLICY.hospital} · {POLICY.extras}</b>
            {Object.entries(POLICY.limits).map(([s, l]) => <div key={s}><span>{s}</span><i><em style={{ width: `${(l.used / l.cap) * 100}%` }} /></i><small className="mono">{money(l.cap - l.used)} left</small></div>)}
          </div>
        </div>

        <div className="lab-mid">
          <div className="cl-stage">
            <DocCard d={d} scanning={scanning} />
            <div className={`cl-fields ${at >= 3 ? 'in' : ''}`}>
              <span className="lab">Extracted · confidence {at >= 2 ? d.conf.toFixed(2) : '–'}</span>
              {Object.entries(d.fields).map(([f, val]) => <div key={f}><span>{f}</span><b>{f === 'fee' ? money(val) : val}</b></div>)}
            </div>
          </div>
          <Trace steps={steps} at={at} title="Agent trace" />
        </div>

        <div className="lab-out">
          <div className={`res ${done ? 'in' : ''}`}>
            <span className="lab">SOP verifier · clause by clause</span>
            <ul className="cl-checks">
              {v.checks.map((c, i) => (
                <li key={c.t} className={at >= 5 ? (c.ok ? 'ok' : 'no') : ''} style={{ transitionDelay: `${i * 90}ms` }}>
                  <i>{at >= 5 ? (c.ok ? '✓' : '×') : ''}</i><div><b>{c.t}</b>{c.s && <span>{c.s}</span>}</div><em className="mono">{c.ref}</em>
                </li>
              ))}
            </ul>
            {done && <div className="res-tier"><Pill tone={v.stp ? 'good' : 'gold'}>{v.route}</Pill>{v.stp && <span>Benefit {money(v.benefit)}</span>}</div>}
            {done && !v.stp && (
              <Approval title={v.route === 'Handler confirms decline' ? 'Confirm the decline' : 'Review the assembled case'} who="Claims handler" sla={1800}
                reasons={[`Classification ${d.kind} at ${d.conf.toFixed(2)}`, ...v.failed.map((c) => `${c.ref}: ${c.s || c.t}`)].slice(0, 3)}
                approveLabel={v.route === 'Handler confirms decline' ? 'Confirm and explain to member' : 'Assess now'} rejectLabel="Request more info" state={appr}
                onApprove={() => { setAppr('approved'); gov.approved(); gov.emit({ kind: 'ok', t: 'Handler decided', s: 'reason written to the member in plain words', toast: true, toastKind: 'ok' }); gov.record({ decision: 'HANDLER DECISION', subject: d.t, by: 'claims handler' }) }}
                onReject={() => { setAppr('rejected'); gov.emit({ kind: 'warn', t: 'More information requested', s: 'member asked for a clearer photo', toast: true, toastKind: 'warn' }) }} />
            )}
            {!done && <button className="btn-run" onClick={go} disabled={at >= 0 && at < steps.length}>{at >= 0 && at < steps.length ? 'Reading…' : 'Run intake'}</button>}
            {done && <button className="btn-run dark" onClick={go}>Run again</button>}
          </div>
          <div className="res in">
            <Slider label="Straight-through confidence threshold" value={th} min={0.6} max={0.99} step={0.01} onChange={setTh} fmt={(x) => x.toFixed(2)} />
            <div className="res-kpis">
              <div><b>{rep.stp.toFixed(0)}%</b><span>of 1,000 replayed claims straight through</span></div>
              <div><b className={rep.wrong > 2 ? 'bad' : ''}>{rep.wrong.toFixed(1)}%</b><span>of those classified wrongly</span></div>
            </div>
            <p className="rc-why">Clause failures always go to a person, whatever the threshold. The threshold only decides how sure the reading must be.</p>
          </div>
        </div>
      </div>
    </Win>
  )
}
