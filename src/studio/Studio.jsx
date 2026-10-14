import { useEffect, useState } from 'react'
import VoiceLab from './VoiceLab.jsx'
import ClaimsLab from './ClaimsLab.jsx'
import EmailLab from './EmailLab.jsx'
import AssureLab from './AssureLab.jsx'
import SharedLab from './SharedLab.jsx'
import { CASES } from '../content.js'
import { TechLogo } from '../ui.jsx'

export const LABS = [
  {
    k: 'voice', n: '01', t: 'Callback voice agent', agenda: 'Marketing & Sales · servicing', C: VoiceLab,
    do: 'Pick a member from the callback queue and place the call. Try the member who asks for a price, the one who is distressed, and the ones the gate never dials.',
    proves: 'Conduct is designed in. The agent cannot quote because it has no quote tool, and distress always reaches a person.',
    cases: ['voice'],
  },
  {
    k: 'claims', n: '02', t: 'Claims intake', agenda: 'Servicing · claims', C: ClaimsLab,
    do: 'Drop a document into intake. The classifier reads it, the SOP verifier checks every clause before payment. Then move the confidence threshold across 1,000 replayed claims.',
    proves: 'Straight-through where the evidence is strong, a fully assembled, cited case for a handler where it is not.',
    cases: ['claims', 'payer'],
  },
  {
    k: 'email', n: '03', t: 'Follow-up email', agenda: 'Personalisation · retention', C: EmailLab,
    do: 'Choose a servicing moment and change the member’s situation. Six agents hand state to each other and the email renders, or fails closed to a clean servicing email.',
    proves: 'The model assembles approved copy. A deterministic gate, not the model, decides who qualifies.',
    cases: ['email'],
  },
  {
    k: 'assure', n: '04', t: 'Call assurance', agenda: 'Compliance · every call', C: AssureLab,
    do: 'Pick a call and run the assessment. Every obligation is checked on its own, with the line that proves it. Agree or override, then scale the review from 2% to every call.',
    proves: 'Full coverage without replacing people. The agent assembles evidence, your analysts make findings, and their overrides improve the set.',
    cases: ['assure'],
  },
  {
    k: 'shared', n: '05', t: 'Shared-services agent', agenda: 'Enterprise Services', C: SharedLab,
    do: 'Ask a Finance, HR, IT or Procurement question, then break the system of record: make it slow, take it down, or lose a write.',
    proves: 'Same gateway, new domain. Retries, circuit breakers, degraded mode and read-back verification are built in, not bolted on.',
    cases: ['claims', 'cloud'],
  },
]

export default function Studio({ onCase }) {
  const [k, setK] = useState('voice')
  useEffect(() => {
    const f = (e) => LABS.some((x) => x.k === e.detail) && setK(e.detail)
    window.addEventListener('studio:open', f)
    return () => window.removeEventListener('studio:open', f)
  }, [])
  const L = LABS.find((x) => x.k === k)
  const cases = L.cases.map((id) => CASES.find((c) => c.id === id))
  return (
    <section className="sec studio" id="studio">
      <div className="wrap">
        <div className="sec-h split">
          <div>
            <span className="sec-num"><i>II</i>Agent Studio</span>
            <h2>Our production work,<em>rebuilt as agents you can run.</em></h2>
          </div>
          <p>Four of these agents are live today in a regulated Australian insurer. The fifth shows the same rail moving into Enterprise Services. They run on synthetic members, policies and documents, and every check is computed in your browser. No Medibank data is used.</p>
        </div>
        <div className="st-tabs" role="tablist">
          {LABS.map((x) => (
            <button key={x.k} role="tab" aria-selected={k === x.k} className={k === x.k ? 'on' : ''} onClick={() => setK(x.k)}>
              <i className="mono">{x.n}</i><b>{x.t}</b><span>{x.agenda}</span>
            </button>
          ))}
        </div>
        <div className="st-brief">
          <div><span className="lab">What you can do</span><p>{L.do}</p></div>
          <div><span className="lab">What it proves</span><p>{L.proves}</p></div>
          <div className="st-case">
            <span className="lab">The case behind it</span>
            {cases.map((c) => (
              <button key={c.id} onClick={() => onCase(c.id)}>
                <b>{c.t}</b>
                <span>{c.sector}</span>
                <em>{c.m[0].v} <i>{c.m[0].l}</i></em>
              </button>
            ))}
          </div>
        </div>
        <div className="st-stage" key={k}><L.C /></div>
        <div className="st-foot">
          {['langgraph', 'langchain', 'mcp', 'claude', 'aws', 'azure', 'salesforce', 'datadog'].map((t) => <TechLogo key={t} k={t} h={18} />)}
          <span>Production versions use the same pattern: tool contracts through one gateway, a deterministic gate before every action, a golden evaluation set, and lineage on every decision.</span>
        </div>
      </div>
    </section>
  )
}
