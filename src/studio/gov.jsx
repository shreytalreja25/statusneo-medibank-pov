// StatusNeo Agent Factory · governed-agent UI kit (canonical copy).
// Copied into each client site as src/studio/gov.jsx (Optus: src/lab/gov.jsx).
// Everything is simulated in the browser: it shows how a governed agent behaves
// (policy gates, eval checks, human approval, an append-only evidence ledger).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const now = () => new Date().toLocaleTimeString('en-AU', { hour12: false })
let SEQ = 0
// FNV-1a, enough to show a hash chain
export function hash(s) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(16).padStart(8, '0')
}

const ICON = { policy: 'P', eval: 'E', human: 'H', warn: '!', stop: '×', ok: '✓', info: 'i', tool: '›' }

// Map a tool call to the kind of governance event it represents
export function kindOf(tool = '') {
  if (/^(policy|guardrail|gate)/.test(tool)) return 'policy'
  if (/^(eval|explain|estimate\.blend)/.test(tool)) return 'eval'
  if (/^human/.test(tool)) return 'human'
  return 'tool'
}

export function useGov({ agent = 'agent', model = 'claude-sonnet', prompt = 'v12', policy = 'v14' } = {}) {
  const [events, setEvents] = useState([])
  const [ledger, setLedger] = useState([])
  const [toasts, setToasts] = useState([])
  const [stats, setStats] = useState({ calls: 0, ms: 0, tokens: 0, blocked: 0, approvals: 0, evals: 0 })
  const head = useRef('genesis')
  const emit = useCallback((e) => {
    const ev = { id: ++SEQ, at: now(), kind: e.kind || 'info', t: e.t, s: e.s, meta: e.meta }
    setEvents((xs) => [ev, ...xs].slice(0, 40))
    if (e.toast) {
      const tid = ev.id
      setToasts((xs) => [{ ...ev, kind: e.toastKind || ev.kind }, ...xs].slice(0, 3))
      setTimeout(() => setToasts((xs) => xs.map((x) => (x.id === tid ? { ...x, out: true } : x))), e.ms || 4200)
      setTimeout(() => setToasts((xs) => xs.filter((x) => x.id !== tid)), (e.ms || 4200) + 400)
    }
    if (e.kind === 'policy' && /block|deny|redact|hold/i.test(`${e.t} ${e.s}`)) setStats((x) => ({ ...x, blocked: x.blocked + 1 }))
    if (e.kind === 'eval') setStats((x) => ({ ...x, evals: x.evals + 1 }))
    return ev
  }, [])
  const record = useCallback((entry) => {
    const body = JSON.stringify({ ...entry, prev: head.current })
    const h = hash(body)
    head.current = h
    setLedger((xs) => [{ id: ++SEQ, at: now(), h, prev: xs[0]?.h || '00000000', ...entry }, ...xs].slice(0, 30))
    return h
  }, [])
  const tool = useCallback((step) => {
    setStats((x) => ({ ...x, calls: x.calls + 1, ms: x.ms + (step.ms || 0), tokens: x.tokens + (/^llm/.test(step.tool) ? 600 + Math.round((step.ms || 100) * 2.4) : 0) }))
    const k = kindOf(step.tool)
    emit({ kind: k === 'tool' ? 'tool' : k, t: step.tool, s: step.out, meta: `${step.ms}ms` })
  }, [emit])
  const dismiss = useCallback((id) => setToasts((xs) => xs.filter((x) => x.id !== id)), [])
  const approved = useCallback(() => setStats((x) => ({ ...x, approvals: x.approvals + 1 })), [])
  const versions = useMemo(() => ({ agent, model, prompt, policy }), [agent, model, prompt, policy])
  return { events, ledger, toasts, stats, emit, record, tool, dismiss, approved, versions }
}

export function Toasts({ gov }) {
  return (
    <div className="toasts" aria-live="polite">
      {gov.toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind} ${t.out ? 'out' : ''}`} role="status">
          <span className="ti">{ICON[t.kind] || 'i'}</span>
          <div><b>{t.t}</b>{t.s && <span>{t.s}</span>}</div>
          <button onClick={() => gov.dismiss(t.id)} aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  )
}

export function GovPanel({ gov, extra }) {
  const { stats, versions } = gov
  const cost = (stats.tokens / 1e6) * 9 + stats.calls * 0.00002
  return (
    <div className="gov">
      <div className="gov-guard">
        <span><i />agent <b>{versions.agent}</b></span>
        <span><i className="gold" />model <b>{versions.model}</b></span>
        <span><i className="gold" />prompt <b>{versions.prompt}</b></span>
        <span><i />policy <b>{versions.policy}</b></span>
        <span>tool calls <b>{stats.calls}</b></span>
        <span>latency <b>{stats.ms}ms</b></span>
        <span>tokens <b>{stats.tokens.toLocaleString('en-AU')}</b></span>
        <span>cost <b>${cost.toFixed(4)}</b></span>
        <span><i className={stats.blocked ? 'warn' : ''} />guardrail hits <b>{stats.blocked}</b></span>
        <span>human approvals <b>{stats.approvals}</b></span>
        {extra}
      </div>
      <div className="gov-feed">
        <div className="gov-feed-h"><span className="lab">Live governance feed</span><span className="micro">{gov.events.length} events</span></div>
        {gov.events.length ? (
          <ul>
            {gov.events.map((e) => (
              <li key={e.id} className={`gev ${e.kind}`}>
                <time>{e.at}</time>
                <span className="gi">{ICON[e.kind] || '›'}</span>
                <div><b>{e.t}</b>{e.s ? <span> · {e.s}</span> : null}</div>
                {e.meta && <em>{e.meta}</em>}
              </li>
            ))}
          </ul>
        ) : <p className="gov-empty">Run the agent to see every tool call, policy check and approval as it happens.</p>}
      </div>
      <div className="gov-ledger">
        <div className="gov-feed-h"><span className="lab">Evidence ledger · append-only</span><span className="micro">{gov.ledger.length}</span></div>
        {gov.ledger.length ? (
          <ol>
            {gov.ledger.map((l) => (
              <li key={l.id} className="led">
                <b>{l.decision}</b> <i>#{l.h}</i>
                <span>{l.subject} · {l.by}</span>
                <span>prev #{l.prev} · {l.at} · {versions.model} · prompt {versions.prompt} · policy {versions.policy}</span>
              </li>
            ))}
          </ol>
        ) : <p className="gov-empty">Each decision is sealed here with its inputs, versions and approver.</p>}
      </div>
    </div>
  )
}

// Human-in-the-loop card with an SLA countdown
export function Approval({ title, who, sla = 900, reasons = [], onApprove, onReject, approveLabel = 'Approve', rejectLabel = 'Reject', state = 'pending' }) {
  const [left, setLeft] = useState(sla)
  useEffect(() => {
    if (state !== 'pending') return
    setLeft(sla)
    const id = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000)
    return () => clearInterval(id)
  }, [state, sla, title])
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0')
  return (
    <div className={`approval ${state === 'approved' ? 'done' : state === 'rejected' ? 'rejected' : ''}`}>
      <div className="approval-h">
        <b>{state === 'pending' ? title : state === 'approved' ? 'Approved' : 'Rejected'}</b>
        {state === 'pending' ? <span className="sla">SLA {mm}:{ss} · {who}</span> : <span className="sla" style={{ color: 'var(--muted)' }}>by {who}</span>}
      </div>
      {reasons.length > 0 && <ul>{reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
      {state === 'pending' && (
        <div className="approval-a">
          <button className="yes" onClick={onApprove}>{approveLabel}</button>
          <button className="no" onClick={onReject}>{rejectLabel}</button>
        </div>
      )}
    </div>
  )
}
