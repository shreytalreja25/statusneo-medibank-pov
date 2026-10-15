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
    k: 'voice', n: '01', t: 'The agent that cannot sell', agenda: 'Voice · member callbacks', C: VoiceLab,
    do: 'Work the callback queue. One member asks for a price, one is having a hard week, and two should never be called at all. Watch what the agent does with each.',
    proves: 'Conduct is designed in, not instructed. There is no quote tool to misuse, and distress always reaches a person.',
    cases: ['voice'],
  },
  {
    k: 'claims', n: '02', t: 'Checked before it pays', agenda: 'Claims · intake to payment', C: ClaimsLab,
    do: 'Drop in a receipt or a hospital account. One is a duplicate, one is unreadable, one is excluded. See which claims pay themselves, then tune the threshold across 1,000 more.',
    proves: 'Clean claims flow straight through. Everything else reaches a handler already assembled, with the clause that decided it.',
    cases: ['claims', 'payer'],
  },
  {
    k: 'email', n: '03', t: 'Knowing when to say less', agenda: 'Personalisation · retention', C: EmailLab,
    do: 'Pick a moment: after a claim, after a call, before renewal. Change the member’s situation and watch six agents decide what gets written, and when to leave the offer out.',
    proves: 'The model writes only from approved copy. A rules gate, never the model, decides who hears about what.',
    cases: ['email'],
  },
  {
    k: 'assure', n: '04', t: 'Every call, not two in a hundred', agenda: 'Compliance assurance', C: AssureLab,
    do: 'Four recorded calls, three with something wrong in them. Find the issues, see the exact line that proves each one, then confirm or overrule the agent.',
    proves: 'Full coverage without taking the decision away from your analysts. Every override makes the checks sharper.',
    cases: ['assure'],
  },
  {
    k: 'shared', n: '05', t: 'One gateway, any back office', agenda: 'Finance · HR · IT · Procurement', C: SharedLab,
    do: 'Ask a Finance, HR, IT or Procurement question. Then break the system behind it: slow it down, take it offline, or lose a write.',
    proves: 'It retries, waits honestly or catches its own mistake. A new domain is configuration on the same safety rail.',
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
            <h2>Five agents.<em>Run them yourself.</em></h2>
          </div>
          <p>Four are rebuilt from agents live today in a regulated Australian insurer. The fifth takes the same rail into Finance, HR and IT. Synthetic members, real logic, every check computed in your browser. Nothing here touches Medibank data.</p>
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
