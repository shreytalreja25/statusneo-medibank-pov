// Synthetic, health-insurer-shaped data and the agent logic behind the Agent Studio.
// Nothing here is Medibank data. Names, policies and amounts are invented for the demo.

export function rng(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}
export function hashStr(s) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(16).padStart(8, '0').slice(0, 7)
}
const money = (v) => `$${v.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export { money }

/* ------------------------------------------------------------------ 01 · Callback voice agent */
export const CALLBACKS = [
  { id: 'cb1', name: 'Marcus C.', reason: 'Outstanding underwriting information', window: '14:30', requested: true, consent: true, dnc: false, attempts: 0, script: 'standard' },
  { id: 'cb2', name: 'Priya S.', reason: 'Asked about moving to a higher hospital tier', window: '15:00', requested: true, consent: true, dnc: false, attempts: 1, script: 'quote' },
  { id: 'cb3', name: 'Evan B.', reason: 'Follow-up on a sales enquiry', window: '15:15', requested: true, consent: true, dnc: false, attempts: 0, script: 'distress' },
  { id: 'cb4', name: 'Nora W.', reason: 'Follow-up on a sales enquiry', window: '—', requested: false, consent: true, dnc: false, attempts: 0, script: 'blocked' },
  { id: 'cb5', name: 'Daniel O.', reason: 'Outstanding underwriting information', window: '16:00', requested: true, consent: true, dnc: true, attempts: 0, script: 'blocked' },
  { id: 'cb6', name: 'Grace L.', reason: 'Outstanding underwriting information', window: '16:30', requested: true, consent: true, dnc: false, attempts: 3, script: 'blocked' },
]
export const TOOLS = [
  { t: 'application.read', on: true }, { t: 'requirements.lookup', on: true }, { t: 'callback.reschedule', on: true },
  { t: 'transfer.warm', on: true }, { t: 'quote.price', on: false }, { t: 'offer.present', on: false }, { t: 'policy.change', on: false },
]
export function voiceGate(m) {
  const checks = [
    { t: 'Callback requested by the member', ok: m.requested, s: m.requested ? `Requested for the ${m.window} window` : 'No request on file' },
    { t: 'Inside the chosen window', ok: m.requested, s: m.requested ? 'Within ±10 minutes' : 'No window' },
    { t: 'Consent on file', ok: m.consent, s: 'Verified before dialling' },
    { t: 'Do Not Call Register', ok: !m.dnc, s: m.dnc ? 'Number is registered' : 'Checked, clear' },
    { t: 'Attempt cap', ok: m.attempts < 3, s: `${m.attempts} of 3 used` },
  ]
  return { checks, pass: checks.every((c) => c.ok) }
}
export const SCRIPTS = {
  standard: [
    ['agent', 'Hi Marcus, it’s Aria from the health insurance team. You asked us to call back at 2:30 today. Is now still a good time?'],
    ['member', 'Yes, I’ve got a few minutes. What’s this about?'],
    ['agent', 'Your application is waiting on one thing: a signed health declaration. I can send a secure link now, and it takes about five minutes.'],
    ['member', 'Great, send it through.'],
    ['agent', 'Done. You’ll get a text in the next minute. Once it’s signed your cover can start from the date you chose.'],
  ],
  quote: [
    ['agent', 'Hi Priya, it’s Aria. You asked us to call back at 3:00 about your application. Is now okay?'],
    ['member', 'Yes. Actually, how much more would the top hospital tier cost me?'],
    ['agent', 'That’s a good question for one of our licensed consultants, who can take you through the options properly. I’ll put you through now, with your details so you don’t repeat yourself.'],
  ],
  distress: [
    ['agent', 'Hi Evan, it’s Aria, calling back as you asked at 3:15. Is now still okay?'],
    ['member', 'Honestly it’s not a great time. My dad’s just been admitted and I’m really stressed about all of this.'],
    ['agent', 'I’m sorry to hear that, Evan. I’m going to connect you with one of our team right now, and there’s nothing you need to do on the application today.'],
  ],
}
export const VOICE_KPI = { control: { rpc: 23, cost: 14.2 }, agent: { rpc: 39, cost: 5.6 } }

/* ------------------------------------------------------------------ 02 · Claims classifier + SOP verifier */
export const POLICY = {
  id: 'POL-5521-09', holder: 'Synthetic member', hospital: 'Gold hospital', extras: 'Mid extras', start: '2023-02-01',
  limits: { dental: { cap: 800, used: 420 }, physio: { cap: 500, used: 500 }, optical: { cap: 250, used: 0 } },
}
export const DOCS = [
  { k: 'dental', t: 'Dental receipt', kind: 'Extras · dental', icon: 'D', conf: 0.97, fields: { provider: 'Harbourside Dental (recognised)', item: '114 · scale and clean', date: '02 Oct 2026', fee: 185 }, svc: 'dental', rate: 0.6, flags: {} },
  { k: 'physio', t: 'Physio receipt', kind: 'Extras · physiotherapy', icon: 'P', conf: 0.95, fields: { provider: 'Northside Physio (recognised)', item: '505 · subsequent consult', date: '29 Sep 2026', fee: 95 }, svc: 'physio', rate: 0.6, flags: { limit: true } },
  { k: 'hospital', t: 'Hospital account', kind: 'Hospital · admitted', icon: 'H', conf: 0.93, fields: { provider: 'Private hospital (agreement)', item: 'Knee arthroscopy · 1 night', date: '21 Sep 2026', fee: 3420 }, svc: 'hospital', rate: 1, flags: {} },
  { k: 'optical', t: 'Optical receipt (photo)', kind: 'Extras · optical', icon: 'O', conf: 0.71, fields: { provider: 'Eyewear store (unclear)', item: 'Prescription lenses', date: '1? Sep 2026', fee: 340 }, svc: 'optical', rate: 0.6, flags: { blurry: true } },
  { k: 'dup', t: 'Dental receipt (again)', kind: 'Extras · dental', icon: 'D', conf: 0.97, fields: { provider: 'Harbourside Dental (recognised)', item: '114 · scale and clean', date: '02 Oct 2026', fee: 185 }, svc: 'dental', rate: 0.6, flags: { dup: true } },
  { k: 'cosmetic', t: 'Clinic invoice', kind: 'Hospital · day procedure', icon: 'C', conf: 0.9, fields: { provider: 'Day clinic', item: 'Cosmetic procedure', date: '18 Sep 2026', fee: 2900 }, svc: 'cosmetic', rate: 0, flags: { excluded: true } },
]
export function verify(doc, threshold) {
  const lim = POLICY.limits[doc.svc]
  const remaining = lim ? lim.cap - lim.used : Infinity
  const checks = [
    { t: 'Policy active on the date of service', ok: true, ref: 'SOP 2.1' },
    { t: 'Waiting period served', ok: true, ref: 'Policy 4.3' },
    { t: 'Service covered by this cover tier', ok: !doc.flags.excluded, ref: 'Policy 6.1', s: doc.flags.excluded ? 'Cosmetic procedures are excluded' : 'Covered' },
    { t: 'Annual limit remaining', ok: remaining > 0, ref: 'Policy 7.2', s: lim ? `${money(Math.max(0, remaining))} of ${money(lim.cap)} left` : 'No annual limit' },
    { t: 'Provider recognised', ok: !/unclear/.test(doc.fields.provider), ref: 'SOP 3.4', s: doc.fields.provider },
    { t: 'Not a duplicate of a paid claim', ok: !doc.flags.dup, ref: 'SOP 5.2', s: doc.flags.dup ? 'Matches claim CLM-88412, paid 03 Oct' : 'No match' },
    { t: 'All required fields legible', ok: !doc.flags.blurry, ref: 'SOP 1.6', s: doc.flags.blurry ? 'Date unreadable' : 'Complete' },
  ]
  const failed = checks.filter((c) => !c.ok)
  const benefit = failed.length ? 0 : Math.min(doc.fields.fee * doc.rate, remaining)
  const stp = doc.conf >= threshold && failed.length === 0
  const decline = failed.some((c) => /covered|limit|duplicate/i.test(c.t)) && doc.conf >= threshold
  return { checks, failed, benefit, stp, route: stp ? 'Straight through' : decline ? 'Handler confirms decline' : 'Handler review', }
}
// Replay 1,000 claims to show the threshold trade-off
export function claimsReplay(threshold, seed = 4) {
  const R = rng(seed)
  let stp = 0, wrong = 0, handler = 0
  for (let i = 0; i < 1000; i++) {
    const hard = R() < 0.18
    const conf = hard ? 0.55 + R() * 0.35 : 0.82 + R() * 0.18
    const correct = R() < (hard ? 0.78 : 0.995)
    if (conf >= threshold) { stp++; if (!correct) wrong++ } else handler++
  }
  return { stp: stp / 10, wrong: (wrong / Math.max(1, stp)) * 100, handler }
}

/* ------------------------------------------------------------------ 03 · Follow-up email, six agents */
export const EVENTS = [
  { k: 'claim', t: 'After a claim', s: 'Dental claim paid this morning' },
  { k: 'call', t: 'After a servicing call', s: 'Member called to update their address' },
  { k: 'renew', t: 'Before a renewal', s: 'Cover renews in 30 days' },
]
export const EMAIL_AGENTS = ['Trigger & context', 'Eligibility gate', 'Copy retrieval', 'Assembly', 'Guardrail & disclosure', 'Lineage']
export function eligibility(p, ev) {
  const rules = [
    { r: 'R-01', t: 'Marketing consent on file', ok: p.consent, need: true },
    { r: 'R-04', t: 'No open complaint or hardship flag', ok: !p.hardship, need: true },
    { r: 'R-07', t: 'Not contacted with an offer in the last 30 days', ok: !p.recent, need: true },
    { r: 'R-12', t: 'Related cover is something the member qualifies for', ok: ev === 'call' ? p.moved : ev === 'claim' ? !p.extrasTop : p.lifeChange, need: true },
  ]
  return { rules, pass: rules.every((r) => r.ok) }
}
export function compose(p, ev, pass) {
  const first = 'Alex'
  const base = {
    claim: { subj: 'Your dental claim has been paid', lead: `Hi ${first}, your claim for a scale and clean at Harbourside Dental has been paid: $111.00 back to your account. You have $269.00 of dental cover left this year.`, next: 'Nothing else to do. Your next check-up is covered from 2 April.' },
    call: { subj: 'Your new address is confirmed', lead: `Hi ${first}, thanks for calling today. We’ve updated your address and your cover stays exactly the same.`, next: 'Your next premium is unchanged. Your membership card will arrive at your new address within 10 days.' },
    renew: { subj: 'Your year with us, before your cover renews', lead: `Hi ${first}, your cover renews in 30 days. This year you made 4 extras claims and got $612.00 back.`, next: 'Your premium and cover stay the same unless you choose to change them.' },
  }[ev]
  const offer = pass ? {
    claim: 'You use your extras regularly. Top extras would raise your dental limit to $1,500. See what changes.',
    call: 'Moving interstate? Ambulance cover rules differ by state. Check yours in two minutes.',
    renew: 'Your circumstances have changed this year. A cover check takes five minutes and could suit you better.',
  }[ev] : null
  return { ...base, offer, blocks: pass ? ['B-112 v4', 'B-204 v2', 'B-318 v7'] : ['B-112 v4', 'B-204 v2'] }
}

/* ------------------------------------------------------------------ 04 · Call compliance assurance */
export const CALLS = [
  { k: 'clean', t: 'New join · clean', fails: [] },
  { k: 'cooling', t: 'New join · cooling-off missed', fails: ['cooling'] },
  { k: 'pressure', t: 'Upgrade · pressure to decide', fails: ['pressure', 'gaw'] },
  { k: 'vulnerable', t: 'Servicing · vulnerability missed', fails: ['vuln'] },
]
export const OBLIGATIONS = [
  { k: 'id', t: 'Identity verified before discussing the policy', v: 'v3' },
  { k: 'privacy', t: 'Privacy statement read', v: 'v5' },
  { k: 'gaw', t: 'General advice warning given', v: 'v4' },
  { k: 'waiting', t: 'Waiting periods stated accurately', v: 'v6' },
  { k: 'cooling', t: '30-day cooling-off explained', v: 'v2' },
  { k: 'pressure', t: 'No pressure to decide on the call', v: 'v3' },
  { k: 'vuln', t: 'Vulnerability recognised and handled', v: 'v2' },
  { k: 'consent', t: 'Explicit consent before any change', v: 'v4' },
]
const TX = {
  id: ['Consultant', 'Before we go on, can you confirm your date of birth and postcode?'],
  privacy: ['Consultant', 'Just so you know, this call is recorded and we handle your information under our privacy policy.'],
  gaw: ['Consultant', 'Anything I say is general information and doesn’t take your personal circumstances into account.'],
  waiting: ['Consultant', 'There’s a 12-month waiting period for pre-existing conditions and 2 months for most extras.'],
  cooling: ['Consultant', 'And you’ve got 30 days to change your mind for a full refund, as long as you haven’t claimed.'],
  pressure: ['Consultant', 'Take your time, you can call us back once you’ve thought about it.'],
  vuln: ['Consultant', 'That sounds like a lot to deal with. Would it help if I slowed down, or called you back another day?'],
  consent: ['Consultant', 'So, do you want me to go ahead and make that change today?'],
}
const BAD = {
  gaw: null,
  cooling: null,
  pressure: ['Consultant', 'Honestly this price is only good if you lock it in on this call, so I’d do it now.'],
  vuln: ['Consultant', 'Okay, moving on to your extras cover then.'],
}
export function transcript(call) {
  const lines = [['Member', 'Hi, I’m calling about my cover.']]
  OBLIGATIONS.forEach((o) => {
    if (call.fails.includes(o.k)) { const b = BAD[o.k]; if (b) lines.push(b) }
    else if (o.k !== 'vuln') lines.push(TX[o.k])
    if (o.k === 'waiting' && call.k === 'vulnerable') lines.push(['Member', 'Sorry, it’s a hard week. My partner lost their job and I’m not sure we can keep paying.'])
    if (o.k === 'waiting') lines.push(['Member', 'Okay, that makes sense.'])
  })
  lines.push(['Member', 'Yes, go ahead.'])
  return lines
}
export function assess(call) {
  const lines = transcript(call)
  return OBLIGATIONS.map((o) => {
    const fail = call.fails.includes(o.k)
    const idx = lines.findIndex((l) => l === (fail ? BAD[o.k] : TX[o.k]))
    return { ...o, ok: !fail, line: idx, conf: fail ? 0.86 + (o.k.length % 5) / 50 : 0.9 + (o.k.length % 4) / 40 }
  })
}

/* ------------------------------------------------------------------ 05 · Shared-services agent on the same gateway */
export const DOMAINS = [
  { k: 'fin', t: 'Finance', sys: 'ERP', ask: 'Match supplier invoice INV-30418 to its purchase order and approve if it matches.', read: 'PO-77120 · 3 lines · $18,420.00', act: 'invoice.approve', result: 'Three-way match: PO, receipt and invoice agree. Approved for the next payment run.' },
  { k: 'hr', t: 'HR', sys: 'HCM', ask: 'How much parental leave do I have, and can you book the first two weeks from 3 November?', read: 'Leave balance · policy HR-14 v6', act: 'leave.request', result: '18 weeks paid parental leave available (HR-14 §2.1). Two weeks from 3 November requested and sent to your manager.' },
  { k: 'it', t: 'IT', sys: 'ITSM', ask: 'Laptop can’t reach the claims portal since this morning’s update.', read: '42 similar tickets in 2h · CHG-55120', act: 'ticket.create', result: 'Linked to a known incident caused by change CHG-55120. Ticket raised as P3 and attached to the incident; workaround sent.' },
  { k: 'proc', t: 'Procurement', sys: 'Contracts', ask: 'Does the new vendor agreement keep member data in Australia?', read: 'MSA draft v3 · 64 clauses', act: 'review.flag', result: 'Clause 18.2 allows offshore processing with notice. Flagged for legal with the clause cited and the standard wording attached.' },
]
export const FAULTS = {
  none: { t: 'Healthy', s: 'Systems of record respond normally' },
  slow: { t: 'Slow system', s: 'First call times out at 3s' },
  down: { t: 'System down', s: 'Circuit breaker opens after 3 failures' },
  lost: { t: 'Write did not land', s: 'Read-back finds no matching record' },
}
export function gatewaySteps(d, fault) {
  const steps = [
    { tool: 'identity.scope', in: `${d.t} agent · user token`, out: 'scoped to own records and approved actions', ms: 8 },
    { tool: 'guardrail.pii', in: 'request text', out: 'no member health data in a staff request', ms: 6 },
    { tool: `${d.sys.toLowerCase()}.read`, in: d.read, out: fault === 'slow' ? 'timeout · retry 1 of 3 with backoff' : fault === 'down' ? 'failed 3 times · circuit open' : 'read ok', ms: fault === 'slow' ? 3000 : fault === 'down' ? 900 : 140 },
  ]
  if (fault === 'slow') steps.push({ tool: `${d.sys.toLowerCase()}.read`, in: 'retry after 400ms', out: 'read ok', ms: 160 })
  if (fault === 'down') {
    steps.push({ tool: 'mode.degraded', in: `${d.sys} unavailable`, out: 'request queued, person told honestly, no guessing', ms: 4 })
    return steps
  }
  steps.push({ tool: 'llm.reason', in: 'cited sources only', out: 'answer and proposed action drafted', ms: 420 })
  steps.push({ tool: 'policy.gate', in: d.act, out: d.k === 'proc' ? 'flag only → human-led' : 'within limits → agent-led', ms: 3 })
  if (d.k !== 'proc') {
    steps.push({ tool: `${d.sys.toLowerCase()}.write`, in: `${d.act} · idempotency key ${hashStr(d.k + fault)}`, out: 'accepted', ms: 120 })
    steps.push({ tool: 'verify.read_back', in: 'fetch the record just written', out: fault === 'lost' ? 'not found → retry with same key' : 'matches', ms: 90 })
    if (fault === 'lost') steps.push({ tool: `${d.sys.toLowerCase()}.write`, in: 'same idempotency key', out: 'accepted · read-back matches · no duplicate', ms: 130 })
  }
  steps.push({ tool: 'evidence.seal', in: 'inputs, sources, versions', out: 'sealed', ms: 12 })
  return steps
}
