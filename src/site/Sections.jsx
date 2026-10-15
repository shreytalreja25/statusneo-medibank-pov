import { useEffect, useState } from 'react'
import {
  BRIEF, VALUES, RAISED, HELIX, LAYERS, RAIL, ACCEL, WORKFLOWS, CAPS, CASES, POD, RAMP, SQUAD, COMMIT, PROOF_POINTS, META,
} from '../content.js'
import { TechLogo, asset, SNLogo, MedibankLogo, MedibankI } from '../ui.jsx'
import { useInView } from './hooks.js'
import { openLab } from './Hero.jsx'

export function SecHead({ n, lab, a, b, children }) {
  return (
    <div className={`sec-h ${children ? 'split' : ''}`}>
      <div>
        <span className="sec-num"><i>{n}</i>{lab}</span>
        <h2>{a}<em>{b}</em></h2>
      </div>
      {children && <p>{children}</p>}
    </div>
  )
}

export function Reveal({ children, className = '', as: Tag = 'div', delay = 0, ...rest }) {
  const [ref, seen] = useInView(0.05)
  return <Tag ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>{children}</Tag>
}

/* ---------------- I · The idea ---------------- */
export function Brief() {
  const [v, setV] = useState(0)
  return (
    <section className="sec brief" id="brief">
      <div className="wrap">
        <SecHead n="I" lab="The idea" a="Redesign the workflow," b="not the task.">
          {BRIEF.objective} That is the design rule for everything below: an AI capability cell that owns a workflow end to end, from the eligibility rules to the evaluation set.
        </SecHead>
        <div className="br-grid">
          {BRIEF.domains.map((d, i) => (
            <Reveal key={d.k} delay={i * 100} className={`br-d ${d.k}`}>
              <span className="lab">{i ? 'Strand two' : 'Strand one'}</span>
              <b>{d.t}</b>
              <p>{d.s}</p>
              <div className="br-chips">{d.items.map((x) => <span key={x}>{x}</span>)}</div>
            </Reveal>
          ))}
          <Reveal delay={200} className="br-join">
            <span className="lab">Where they meet</span>
            <div className="br-rungs">
              {HELIX.map((h) => (
                <button key={h.k} onClick={() => openLab(h.lab)}>
                  <span className="m">{h.m}</span><i className="mono">{h.agent}</i><span className="e">{h.e}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
        <div className="vals">
          <div className="vals-h">
            <MedibankI size={30} />
            <div><span className="eyebrow">Better Health for Better Lives · your values, as engineering rules</span><p>Each value maps to something we build in, not something we promise.</p></div>
          </div>
          <div className="vals-tabs">
            {VALUES.map((x, i) => <button key={x.v} className={v === i ? 'on' : ''} onClick={() => setV(i)}>{x.v}</button>)}
          </div>
          <div className="vals-b" key={v}><b>{VALUES[v].e}</b><p>{VALUES[v].s}</p></div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- III · Framework ---------------- */
export function Framework() {
  const [L, setL] = useState(3)
  const [a, setA] = useState(null)
  const layer = LAYERS[L]
  return (
    <section className="sec fw-sec" id="framework">
      <div className="wrap">
        <SecHead n="III" lab="How we build" a="Five layers, one control rail," b="and a factory of accelerators.">
          Every agent we ship is assembled from the same framework, which is why the second workflow in a client estate costs materially less than the first. Nothing that matters is left to the prompt: access is decided by the tool contract, conduct by the gate, quality by the evaluation set and accountability by the lineage record.
        </SecHead>
        <div className="fw">
          <div className="fw-stack">
            {LAYERS.map((x, i) => (
              <button key={x.k} className={`fw-l ${L === i ? 'on' : ''} k-${x.k}`} onClick={() => setL(i)} style={{ '--i': i }}>
                <span className="mono">{x.n}</span><b>{x.t}</b>
                <div className="fw-logos">{x.tech.map((t) => <TechLogo key={t} k={t} h={16} />)}</div>
              </button>
            ))}
          </div>
          <div className="fw-rail">
            <span className="lab">Control rail · enforced every turn</span>
            {RAIL.map((r) => <div key={r.t}><b>{r.t}</b><span>{r.s}</span></div>)}
          </div>
          <div className="fw-detail" key={L}>
            <span className="lab">Layer {layer.n}</span>
            <b>{layer.t}</b>
            <p>{layer.s}</p>
            <div className="fw-items">{layer.items.map((x) => <span key={x}>{x}</span>)}</div>
            {layer.k === 'gw' && <div className="fw-quote">No prompt can widen access, because the constraint does not live in the prompt.</div>}
          </div>
        </div>
        <div className="fac">
          <div className="fac-h"><img src={asset('brand/authentic-ai-dark.svg')} alt="AuthenticAI" /><span className="eyebrow">AgentFactory · accelerators that travel between engagements, each run in production</span></div>
          <div className="fac-g">
            {ACCEL.map((x) => (
              <button key={x.t} className={a === x.t ? 'on' : ''} onMouseEnter={() => setA(x.t)} onMouseLeave={() => setA(null)}>
                <b>{x.t === 'Decision Fabric' ? <img src={asset('brand/decision-fabric.png')} alt="Decision Fabric" className="df-in" /> : x.t === 'TestKraft' ? <img src={asset('brand/testkraft.png')} alt="TestKraft" className="tk-in" /> : x.t}</b><span>{x.s}</span>
              </button>
            ))}
          </div>
          <div className="fac-stack">
            <span className="lab">The stack we build on</span>
            {['langgraph', 'langchain', 'mcp', 'aws', 'azure', 'googlecloud', 'claude', 'snowflake', 'databricks', 'datadog', 'opentelemetry', 'salesforce'].map((t) => <TechLogo key={t} k={t} h={20} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- IV · Reuse map ---------------- */
export function Reuse() {
  const [c, setC] = useState(0)
  const cap = CAPS[c]
  return (
    <section className="sec reuse-sec" id="reuse">
      <div className="wrap">
        <SecHead n="IV" lab="Built once, reused" a="One domain pays for the pattern." b="The next one gets it as configuration.">
          Capability built in one domain should pay for itself again in the next. These are the patterns that already travelled in production, and where each would land across your two domains. Pick a capability.
        </SecHead>
        <div className="ru">
          <div className="ru-caps">
            {CAPS.map((x, i) => (
              <button key={x.k} className={c === i ? 'on' : ''} onClick={() => setC(i)}>
                <b>{x.t}</b><span>first built for {x.from.toLowerCase()}</span><em className="mono">{x.on.length} / {WORKFLOWS.length}</em>
              </button>
            ))}
          </div>
          <div className="ru-map">
            {['mse', 'es'].map((d) => (
              <div key={d} className={`ru-d ${d}`}>
                <span className="lab">{d === 'mse' ? 'Marketing & Sales Effectiveness' : 'Enterprise Services'}</span>
                <div>
                  {WORKFLOWS.filter((w) => w.d === d).map((w, i) => {
                    const on = cap.on.includes(w.k)
                    return <div key={w.k} className={`ru-w ${on ? 'on' : ''}`} style={{ transitionDelay: `${i * 60}ms` }}><i />{w.t}</div>
                  })}
                </div>
              </div>
            ))}
            <div className="ru-note" key={c}><b>{cap.t}.</b> {cap.s}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- V · Proof ---------------- */
export function Cases({ onCase }) {
  const lead = CASES.filter((c) => c.lead)
  const health = CASES.filter((c) => !c.lead)
  return (
    <section className="sec cases-sec" id="cases">
      <div className="wrap">
        <SecHead n="V" lab="Proof" a="Live in a regulated Australian insurer," b="with health depth behind it.">
          Four production deployments in one Australian financial services and insurance provider, each baselined against a randomised control or holdout. Behind them, payer and provider work across claims, networks, regulatory reporting and cloud. Client names are withheld at their request.
        </SecHead>
        <div className="cs-lead">
          {lead.map((c, i) => (
            <Reveal key={c.id} as="article" delay={i * 70}>
              <button onClick={() => onCase(c.id)}>
                <span className="fit">{c.fit}</span>
                <b>{c.t}</b>
                <div className="cm">{c.m.map((m) => <div key={m.l}><strong>{m.v}</strong><span>{m.l}</span></div>)}</div>
                <div className="cs-tl">{c.timeline.map(([t, w]) => <i key={t} style={{ flex: w }} className={t.toLowerCase()} title={`${t} · ${w} weeks`} />)}<span className="mono">{c.timeline.reduce((s, [, w]) => s + w, 0)} weeks</span></div>
                <div className="ct">{c.tech.map((k) => <TechLogo key={k} k={k} h={16} />)}<em>Timeline, team and stack →</em></div>
              </button>
            </Reveal>
          ))}
        </div>
        <div className="cs-health">
          <span className="eyebrow">Health depth · payer and provider</span>
          <div>
            {health.map((c, i) => (
              <Reveal key={c.id} delay={i * 60} as="article">
                <button onClick={() => onCase(c.id)}>
                  <i className="mono">{c.sector}</i><b>{c.t}</b><strong>{c.m[0].v} <span>{c.m[0].l}</span></strong>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function CaseModal({ id, onClose, onLab }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [onClose])
  const C = CASES.find((c) => c.id === id)
  if (!C) return null
  const total = C.timeline ? C.timeline.reduce((s, [, w]) => s + w, 0) : 0
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        <span className="fit">{C.fit} · client masked at their request</span>
        <h3>{C.t}</h3>
        <i>{C.sector}</i>
        <div className="modal-cols">
          <div><span className="lab">The problem</span><p>{C.p}</p></div>
          <div><span className="lab">What we built</span><p>{C.b}</p></div>
        </div>
        <div className="cm big">{C.m.map((m) => <div key={m.l}><strong>{m.v}</strong><span>{m.l}</span></div>)}</div>
        {C.timeline && (
          <div className="md-tl">
            <span className="lab">Delivery timeline · {total} weeks</span>
            <div>{C.timeline.map(([t, w]) => <span key={t} style={{ flex: w }} className={t.toLowerCase()}><b>{w}w</b>{t}</span>)}</div>
          </div>
        )}
        {C.team && <div className="md-team"><span className="lab">Project team</span><div>{C.team.map((t) => <span key={t}>{t}</span>)}</div></div>}
        <div className="md-stack"><span className="lab">Stack</span><p className="mono">{C.stack}</p></div>
        {C.baseline && <div className="why-t"><span className="lab">How it was measured</span><p>{C.baseline}</p></div>}
        <div className="modal-f">
          <div className="ct">{C.tech.map((k) => <TechLogo key={k} k={k} h={20} />)}</div>
          <button className="btn gold sm" onClick={() => onLab(C.lab)}>Run it in the Agent Studio →</button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- VI · Inside your squad ---------------- */
export function Squad() {
  const [ref, seen] = useInView(0.2)
  const total = POD.reduce((s, p) => s + p.n, 0)
  return (
    <section className="sec squad-sec" id="squad">
      <div className="wrap" ref={ref}>
        <SecHead n="VI" lab="How we would engage" a="A specialist cell, when you need one." b="Inside your squads, never beside them.">
          When a workstream needs more agentic engineering, evaluation or governance depth, a small senior cell joins the squad on the same backlog and definition of done. It starts with two or three specialists and grows only if the work does. Our Australian practice is already in Melbourne.
        </SecHead>
        <div className="sq-grid">
          <div className="sq-pod">
            <span className="lab">Up to a full pod · {total} FTE, if a domain needs it</span>
            <div className="sq-dots">
              {POD.flatMap((p, i) => Array.from({ length: p.n }).map((_, k) => <i key={`${i}${k}`} className={`${p.loc.startsWith('Melbourne') ? 'mel' : 'bl'} ${seen ? 'in' : ''}`} style={{ transitionDelay: `${(i * 2 + k) * 70}ms` }} title={p.r} />))}
            </div>
            <div className="sq-key"><span><i className="mel" />Melbourne, on site</span><span><i className="bl" />Blended</span></div>
            <ul>{POD.map((p) => <li key={p.r}><b>{p.n}×</b><span>{p.r}</span><em>{p.lvl} · {p.loc}</em></li>)}</ul>
            <p className="note">Not a fixed pod. Capability scales up when a domain moves into build and stands down when it does not.</p>
          </div>
          <div className="sq-r">
            <div className={`sq-ramp ${seen ? 'in' : ''}`}>
              <span className="lab">From go-ahead to working software</span>
              <div>{RAMP.map((r, i) => <div key={r.w} style={{ transitionDelay: `${i * 160}ms` }}><i className="mono">{r.w}</i><b>{r.t}</b><span>{r.s}</span></div>)}</div>
            </div>
            <div className="sq-one">{SQUAD.map((s, i) => <Reveal key={s.t} delay={i * 70}><b>{s.t}</b><span>{s.s}</span></Reveal>)}</div>
            <div className="sq-test"><span className="lab">Our proposed handover test</span><p>At the six-month mark, one of your engineers takes a new workflow from specification to production on the control plane, unaided, with us on call and not at the keyboard.</p></div>
          </div>
        </div>
        <div className="raised">
          <span className="eyebrow">Where we add the most depth</span>
          <div>{RAISED.map((r, i) => <Reveal key={r.t} delay={i * 80} className="rz"><i className="mono">0{i + 1}</i><b>{r.t}</b><span>{r.s}</span></Reveal>)}</div>
        </div>
        <div className="commit">
          {COMMIT.map((c, i) => <Reveal key={c.t} delay={i * 80} className="cmt"><MedibankI size={20} /><div><b>{c.t}</b><span>{c.s}</span></div></Reveal>)}
        </div>
      </div>
    </section>
  )
}

/* ---------------- VII · Ask ---------------- */
export function Ask() {
  return (
    <section className="sec ask-sec" id="ask">
      <div className="wrap">
        <div className="ask-grid">
          <div className="ask-photos">
            <img src={asset('photos/team-whiteboard.jpg')} alt="StatusNeo team planning at a whiteboard" loading="lazy" />
            <img src={asset('photos/engineers-pairing.jpg')} alt="StatusNeo engineers pairing on code" loading="lazy" />
          </div>
          <div>
            <SecHead n="VII" lab="The team behind it" a="An Australian squad already in place," b="not one that rotates out." />
            <p className="ask-lede">The people who would join your squads are already delivering for Australian organisations, in Australian hours, under an Australian entity. Engineers on site in two weeks, a full squad at cadence in four, and a second squad on request.</p>
            <div className="pp">{PROOF_POINTS.map((p, i) => <Reveal key={p.l} delay={i * 70}><b>{p.v}</b><span>{p.l}</span></Reveal>)}</div>
            <div className="tm-logos one"><div><span className="lab">Independent recognition</span><img src={asset('brand/recognition.jpg')} alt="StatusNeo awards and recognition" loading="lazy" /></div></div>
          </div>
        </div>
        <div className="ask-card">
          <div>
            <span className="lab">The offer</span>
            <h3>One workflow, ninety minutes, nothing attached.</h3>
            <p>Pick a candidate workflow from either domain and give us ninety minutes in Melbourne. We come back with the eligibility logic, the integration points and the evaluation set we would build against. You keep it either way.</p>
          </div>
          <div className="agenda">
            {[[10, 'Your workflow and its baseline'], [25, 'Live: the agents on your journey'], [15, 'Gateway, evals and lineage'], [10, 'The pod and the first eight weeks']].map(([m, t]) => <div key={t} style={{ flex: m }}><b>{m}′</b><span>{t}</span></div>)}
          </div>
        </div>
        <div className="partner-web"><span className="lab">Partner ecosystem</span><img src={asset('brand/partner-band.jpg')} alt="Google, AWS, Microsoft, ServiceNow, Databricks, Snowflake, Anthropic and other partners" loading="lazy" /></div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-in">
        <div className="foot-l"><SNLogo h={24} /><i>×</i><MedibankLogo h={20} /></div>
        <div className="foot-m"><b>{META.contact.name}</b><span>{META.contact.role} · StatusNeo · {META.contact.web}</span></div>
        <img src={asset('brand/authentic-ai-dark.svg')} alt="AuthenticAI" className="foot-aai" />
      </div>
      <div className="wrap foot-note">Prepared by StatusNeo for Medibank. Private and confidential. The Agent Studio runs on synthetic members, policies, documents and calls; no Medibank data is used. Case outcomes are from StatusNeo production deployments, measured against randomised control or holdout cohorts, with client names withheld. StatusNeo figures are from the Team Composition sheet, Q2 2026.</div>
    </footer>
  )
}
