import { useEffect, useMemo, useState } from 'react'
import { Win, Pill, Seg } from './kit.jsx'
import { useGov } from './gov.jsx'
import { EVENTS, EMAIL_AGENTS, eligibility, compose, hashStr } from '../data/engine.js'
import { asset } from '../ui.jsx'

const STATE = ['RECEIVED', 'GATED', 'GROUNDED', 'ASSEMBLED', 'GUARDRAIL PASS', 'SENT']

export default function EmailLab() {
  const gov = useGov({ agent: 'followup-email@5.0', model: 'gemini (Vertex AI, AU)', prompt: 'assemble v11', policy: 'eligibility v7' })
  const [ev, setEv] = useState('claim')
  const [p, setP] = useState({ consent: true, hardship: false, recent: false, moved: true, extrasTop: false, lifeChange: true })
  const [step, setStep] = useState(-1)
  const el = useMemo(() => eligibility(p, ev), [p, ev])
  const mail = useMemo(() => compose(p, ev, el.pass), [p, ev, el.pass])
  useEffect(() => { setStep(-1) }, [ev, p])
  const set = (k) => setP((x) => ({ ...x, [k]: !x[k] }))
  const lineage = hashStr(ev + JSON.stringify(p))

  const go = () => {
    setStep(0)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    EMAIL_AGENTS.forEach((a, i) => setTimeout(() => {
      setStep(i + 1)
      const out = i === 1 ? (el.pass ? 'eligible · offer block allowed' : `fails closed · ${el.rules.find((r) => !r.ok).r}`) : i === 2 ? `${mail.blocks.length} approved blocks` : i === 4 ? 'PII, tone, disclosure, injection: pass' : i === 5 ? `stamped #${lineage}` : 'ok'
      gov.tool({ tool: `agent.${a.toLowerCase().replace(/[^a-z]+/g, '_')}`, in: STATE[i], out, ms: [40, 3, 210, 180, 90, 8][i] })
      if (i === 1) gov.emit({ kind: 'policy', t: el.pass ? 'Gate passed' : 'Gate failed closed', s: el.pass ? 'deterministic rules, the model never judged' : 'a clean servicing email goes instead', toast: true, toastKind: el.pass ? 'ok' : 'warn' })
      if (i === 5) gov.record({ decision: el.pass ? 'SENT · PERSONALISED' : 'SENT · CLEAN', subject: `${EVENTS.find((e) => e.k === ev).t} · ${mail.blocks.join(', ')}`, by: 'lineage agent' })
    }, (reduce ? 80 : 650) * (i + 1)))
  }

  const toggles = ev === 'call' ? [['moved', 'Moving interstate']] : ev === 'claim' ? [['extrasTop', 'Already on top extras']] : [['lifeChange', 'Life stage changed this year']]

  return (
    <Win title="Follow-up email · six agents, one state machine" gov={gov}>
      <div className="em">
        <div className="lab-ctl">
          <div className="ctl-g"><span className="lab">The moment</span><Seg value={ev} options={EVENTS.map((e) => ({ v: e.k, l: e.t }))} onChange={setEv} small /><p className="note">{EVENTS.find((e) => e.k === ev).s}</p></div>
          <div className="ctl-g">
            <span className="lab">The member, right now</span>
            <button className={`tog wide ${p.consent ? 'on' : ''}`} onClick={() => set('consent')}><i /><span><b>Marketing consent</b><small>Opted in to offers</small></span></button>
            <button className={`tog wide ${p.hardship ? 'on' : ''}`} onClick={() => set('hardship')}><i /><span><b>Hardship or open complaint</b><small>Flag on the member record</small></span></button>
            <button className={`tog wide ${p.recent ? 'on' : ''}`} onClick={() => set('recent')}><i /><span><b>Offer sent in the last 30 days</b><small>Contact frequency rule</small></span></button>
            {toggles.map(([k, t]) => <button key={k} className={`tog wide ${p[k] ? 'on' : ''}`} onClick={() => set(k)}><i /><span><b>{t}</b><small>Decides whether related cover qualifies</small></span></button>)}
          </div>
          <button className="btn-run" onClick={go} disabled={step >= 0 && step < 6}>{step >= 0 && step < 6 ? 'Assembling…' : step === 6 ? 'Send again' : 'Assemble and send'}</button>
        </div>

        <div className="lab-mid">
          <div className="em-sm">
            {EMAIL_AGENTS.map((a, i) => (
              <div key={a} className={`em-a ${step > i ? 'done' : step === i ? 'run' : ''} ${i === 1 && step > 1 ? (el.pass ? 'pass' : 'fail') : ''}`}>
                <i className="mono">{i + 1}</i><b>{a}</b><span className="mono">{step > i ? (i === 1 && !el.pass ? 'FAILED CLOSED' : STATE[i]) : '·'}</span>
              </div>
            ))}
          </div>
          <div className="em-rules">
            <span className="lab">Eligibility gate · deterministic rules</span>
            {el.rules.map((r) => <div key={r.r} className={r.ok ? 'ok' : 'no'}><i className="mono">{r.r}</i><span>{r.t}</span><b>{r.ok ? 'pass' : 'fail'}</b></div>)}
            <p className="note">If any rule fails, the offer block is simply not available to the assembly agent. About 31% of real sends fail closed, and that is the correct outcome.</p>
          </div>
        </div>

        <div className="lab-out">
          <div className={`em-mail ${step === 6 ? 'in' : ''}`}>
            <div className="em-mail-h"><img src={asset('brand/medibank.png')} alt="Medibank" /><span className="mono">To: alex@example.com</span></div>
            <b className="em-subj">{mail.subj}</b>
            <p>{mail.lead}</p>
            <p>{mail.next}</p>
            {mail.offer ? <div className="em-offer">{mail.offer}</div> : <div className="em-none mono">No offer block: gate failed closed</div>}
            <div className="em-foot mono">copy {mail.blocks.join(' · ')} · rules eligibility v7 · approver compliance · #{lineage}</div>
          </div>
          <div className="res in">
            <div className="res-tier"><Pill tone={step === 6 ? (el.pass ? 'good' : 'gold') : 'soft'}>{step === 6 ? (el.pass ? 'Sent personalised' : 'Sent clean') : 'Not sent yet'}</Pill></div>
            <div className="res-kpis">
              <div><b>3.2×</b><span>incremental take-up vs holdout</span></div>
              <div><b>1.4M+</b><span>sends, zero eligibility breaches</span></div>
            </div>
          </div>
        </div>
      </div>
    </Win>
  )
}
