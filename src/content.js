// Single source of copy for the site. House style: plain wording, no em dashes,
// rounded numbers, addressed to Medibank and never to a named individual.
// Sources: StatusNeo production case studies and the StatusNeo healthcare compendium.

export const META = {
  title: 'StatusNeo × Medibank · The Agent Studio',
  kicker: 'Agentic workflows for health insurance · A point of view · October 2026',
  contact: { name: 'Shrey Talreja', role: 'Australian practice lead · Decision Fabric', web: 'statusneo.com' },
}

export const HERO = {
  line1: 'Two domains. One helix.',
  line2: 'Agents built inside your squads.',
  lede:
    'Every member moment and every back-office step, joined by agents that check before they act, explain every decision and leave the code in your hands. Five of them are running on this page. Open one and try to make it misbehave.',
}

// Outcomes from our live Australian deployments, measured against randomised control or holdout cohorts
export const STATS = [
  { v: '1.7×', l: 'Right-party contact', s: 'callback voice agent vs control' },
  { v: '61%', l: 'Lower cost per contact', s: 'same lists, same windows' },
  { v: '1.4M+', l: 'Gated email sends', s: '3.2× incremental take-up' },
  { v: '100%', l: 'Calls reviewed', s: 'up from a 2% sample' },
  { v: '0', l: 'Conduct breaches', s: 'across 48,000 agent calls' },
]

// The helix: member strand (Marketing & Sales) and enterprise strand (Enterprise Services), joined by agents
export const HELIX = [
  { k: 'callback', n: '01', m: 'Asks for a callback', e: 'Contact centre capacity', agent: 'Callback voice agent', lab: 'voice', s: 'Calls only members who asked, in the window they chose. No offer tool exists.' },
  { k: 'claim', n: '02', m: 'Lodges a claim', e: 'Claims assessment', agent: 'Claims classifier + SOP verifier', lab: 'claims', s: 'Reads the document, checks every policy clause and SOP step before payment.' },
  { k: 'pay', n: '03', m: 'Gets paid', e: 'Finance reconciliation', agent: 'Shared-services agent', lab: 'shared', s: 'Matches the benefit to the ledger through the same gateway, with read-back on every write.' },
  { k: 'email', n: '04', m: 'Hears what happens next', e: 'Marketing operations', agent: 'Follow-up email agents', lab: 'email', s: 'Assembles approved copy behind a deterministic eligibility gate. Fails closed.' },
  { k: 'assure', n: '05', m: 'Call is reviewed', e: 'Compliance assurance', agent: 'Call assurance agent', lab: 'assure', s: 'Every call scored against the codified obligation set. A person makes the finding.' },
  { k: 'renew', n: '06', m: 'Renews with confidence', e: 'Retention insight', agent: 'Lineage on every send', lab: 'email', s: 'Year-in-review built from real interactions, with the copy and rule version on record.' },
]

export const BRIEF = {
  domains: [
    { k: 'mse', t: 'Marketing & Sales Effectiveness', s: 'Acquisition, retention, personalisation, marketing operations, customer servicing and workflow orchestration.', items: ['Acquisition', 'Retention', 'Personalisation', 'Marketing ops', 'Servicing', 'Orchestration'] },
    { k: 'es', t: 'Enterprise Services', s: 'Finance, HR, IT and technology, procurement, legal and compliance, and shared services.', items: ['Finance', 'HR', 'IT & technology', 'Procurement', 'Legal & compliance', 'Shared services'] },
  ],
  objective: 'Not to automate individual tasks, but to redesign end-to-end workflows using agentic and AI-enabled solutions that improve customer, employee and business outcomes.',
}

// Medibank values, mapped to how we engineer
export const VALUES = [
  { v: 'Customers First', e: 'The gate runs before the action', s: 'Eligibility, consent and conduct are checked in code before a call is dialled, an email renders or a claim is paid.' },
  { v: 'Own It. Do It.', e: 'Measured against a control cohort', s: 'Every outcome is baselined against a randomised control or holdout, not a before-and-after guess.' },
  { v: 'Show Heart.', e: 'Distress always reaches a person', s: 'Any sign of distress, vulnerability or a clinical question triggers a warm transfer, with no retry.' },
  { v: 'One Team.', e: 'One backlog, one definition of done', s: 'We join your squads and ceremonies. No parallel plan, no separate status report.' },
]

// The StatusNeo agentic framework (B1)
export const LAYERS = [
  { k: 'exp', n: '01', t: 'Experience', s: 'Embedded where people already work. An approval queue sits ahead of every write.', items: ['Service desktop', 'CRM console', 'Back-office queue', 'Contact centre', 'Voice', 'Chat'], tech: ['react', 'salesforce'] },
  { k: 'orch', n: '02', t: 'Orchestration', s: 'Enumerable states, not one large prompt. Every path can be asserted in a test.', items: ['Single agent', 'Supervisor', 'Multi-agent over A2A', 'Human in the loop'], tech: ['langgraph', 'langchain', 'mcp'] },
  { k: 'mem', n: '03', t: 'Memory and context', s: 'Medibank owns the schema and the content. Entitlement filters apply before retrieval, never after.', items: ['Member profile', 'Episodic memory', 'Semantic index', 'Relationship graph', 'Cited retrieval'], tech: ['postgresql', 'neo4j'] },
  { k: 'gw', n: '04', t: 'Tool and data gateway', s: 'The trust boundary. No prompt can widen access, because the constraint does not live in the prompt.', items: ['MCP contracts', 'Scoped identity', 'Masking at source', 'Circuit breakers', 'Idempotent writes', 'Degraded modes', 'Read-back verification'], tech: ['mcp', 'opa'] },
  { k: 'sor', n: '05', t: 'Systems of record', s: 'Read and written in place, so no shadow copy of member or commercial data is created.', items: ['Policy, claims, provider', 'CRM and marketing automation', 'ERP, HCM, ITSM', 'Lakehouse', 'Identity'], tech: ['salesforce', 'snowflake', 'azure', 'aws'] },
]

export const RAIL = [
  { t: 'Identity', s: 'Scoped tokens, row and field entitlement' },
  { t: 'Guardrails', s: 'Policy and PII screen, injection defence' },
  { t: 'Evaluation', s: 'Golden-set gate, shadow before rollout' },
  { t: 'Observability', s: 'Per-turn tracing, cost and drift' },
  { t: 'Lineage', s: 'Model, prompt and rule version, immutable evidence' },
]

export const ACCEL = [
  { t: 'NeoVoice', s: 'Voice agents, consent-gated' }, { t: 'NeoGen', s: 'Grounded enterprise search' }, { t: 'NeoArkitect', s: 'Design to service contracts' },
  { t: 'NeoOps', s: 'Triage, RCA, self-healing' }, { t: 'NeoSecurity', s: 'Runtime security' }, { t: 'TestKraft', s: 'Risk-ranked test estate' },
  { t: 'Sync AI', s: 'Plan to spend to shipped work' }, { t: 'Slash Commands', s: 'Core build execution' }, { t: 'NeoLens', s: 'Decision intelligence' },
  { t: 'FinOps', s: 'Token and cloud spend' }, { t: 'SDLC Agents', s: 'Story to release' }, { t: 'Decision Fabric', s: 'Process discovery and redesign' },
]

// Reuse map (A4): capabilities built once, reused across both domains
export const WORKFLOWS = [
  { k: 'acq', d: 'mse', t: 'Acquisition' }, { k: 'ret', d: 'mse', t: 'Retention' }, { k: 'pers', d: 'mse', t: 'Personalisation' }, { k: 'serv', d: 'mse', t: 'Servicing' },
  { k: 'fin', d: 'es', t: 'Finance' }, { k: 'hr', d: 'es', t: 'HR' }, { k: 'it', d: 'es', t: 'IT' }, { k: 'proc', d: 'es', t: 'Procurement' }, { k: 'legal', d: 'es', t: 'Legal & compliance' },
]
export const CAPS = [
  { k: 'gate', t: 'Deterministic eligibility gate', from: 'Follow-up email', s: 'Rules decide who qualifies; the model never judges. Became the conduct-gating template across the estate.', on: ['acq', 'ret', 'pers', 'serv', 'hr', 'legal'] },
  { k: 'cite', t: 'Cited retrieval over approved content', from: 'Follow-up email', s: 'Grounds only on versioned, approved blocks. The same pattern grounds the claims provenance trail.', on: ['pers', 'serv', 'hr', 'it', 'legal', 'proc'] },
  { k: 'assure', t: 'Obligation-by-obligation assurance', from: 'Call compliance', s: 'Built for human calls, reused to assure the voice agent’s own calls. Configuration, not a second system.', on: ['acq', 'serv', 'legal', 'proc'] },
  { k: 'doc', t: 'Document classify and verify', from: 'Claims intake', s: 'Multimodal classification, then a rule-by-rule check against the version in force.', on: ['serv', 'fin', 'hr', 'proc', 'legal'] },
  { k: 'lineage', t: 'Send and decision lineage', from: 'Follow-up email', s: 'Copy version, rule version and approver stamped on every action, so any decision can be rebuilt months later.', on: ['acq', 'ret', 'pers', 'serv', 'fin', 'hr', 'it', 'proc', 'legal'] },
  { k: 'gateway', t: 'One tool and data gateway', from: 'Every engagement', s: 'Scoped identity, masking, circuit breakers and read-back verification, the same for ERP, HCM, ITSM or CRM.', on: ['serv', 'fin', 'hr', 'it', 'proc'] },
]

export const CASES = [
  {
    id: 'voice', lead: true, fit: 'Live in production', sector: 'Leading Australian financial services and insurance provider', lab: 'voice',
    t: 'A voice agent that only calls people who asked to be called',
    p: 'Outbound follow-up for sales enquiries and outstanding underwriting information was slow and costly, and any outbound AI carried real conduct risk.',
    b: 'A callback-only voice agent. An eligibility gate runs before the dialler fires: callback requested, window, consent, do-not-call and attempt cap. The agent holds no offer, quote or pricing tool, so anti-hawking is structural. Distress or any clinical question triggers a warm transfer.',
    m: [{ v: '1.7×', l: 'right-party contact vs control' }, { v: '61%', l: 'lower cost per contact' }, { v: '0', l: 'conduct breaches in 48,000 calls' }],
    timeline: [['Discovery', 4], ['Build', 13], ['Hardening', 4], ['Go-live', 1]],
    team: ['Engagement Lead', 'AI FDE', '3 × AI Engineer', 'Eval Specialist', 'QA Engineer'],
    tech: ['langgraph', 'aws', 'python', 'datadog'], stack: 'LangGraph · Genesys Cloud · Whisper ASR · ElevenLabs · Amazon Bedrock · Ragas · Phoenix',
    baseline: 'Randomised human-dialled control cohort over twelve weeks, same lists and windows.',
  },
  {
    id: 'email', lead: true, fit: 'Live in production', sector: 'Same Australian insurer · servicing communications', lab: 'email',
    t: 'Personalised follow-ups that fail safe',
    p: 'Follow-up emails after a servicing interaction came from campaign lists, not from what had just happened with the member.',
    b: 'Six agents on one state machine assemble each email at send time from compliance-approved copy blocks. A deterministic gate decides eligibility before anything renders, and a lineage agent stamps copy, rule and approver on every send.',
    m: [{ v: '3.2×', l: 'incremental take-up vs holdout' }, { v: '1.4M+', l: 'sends in production' }, { v: '0', l: 'eligibility breaches' }],
    timeline: [['Discovery', 2], ['Build', 8], ['Hardening', 4], ['Go-live', 1]],
    team: ['Engagement Lead', 'AI FDE', '2 × AI Engineer', 'Data Engineer', 'Eval Specialist', 'QA Engineer'],
    tech: ['googlecloud', 'salesforce', 'python'], stack: 'Google ADK · Vertex AI · Pinecone · Salesforce Marketing Cloud · Ragas · Phoenix',
    baseline: 'Randomised holdout over nine months.',
  },
  {
    id: 'assure', lead: true, fit: 'Regulated Australian enterprise', sector: 'Same Australian insurer · compliance QA', lab: 'assure',
    t: 'Every call reviewed, not a 2% sample',
    p: 'Compliance QA ran on a 2% sample, so most calls were never reviewed in a category with real remediation exposure, and findings arrived 41 days late.',
    b: 'Every call is scored against a codified, versioned obligation set, one control at a time. The agent assembles the evidence, a person makes the finding, and overrides feed the evaluation set. The same pipeline assures the voice agent’s own calls.',
    m: [{ v: '100%', l: 'review coverage, from 2%' }, { v: '68%', l: 'fewer analyst hours, redeployed' }, { v: '41 → 3 days', l: 'time to coaching' }],
    timeline: [['Discovery', 2], ['Build', 8], ['Hardening', 4], ['Go-live', 1]],
    team: ['Engagement Lead', 'AI FDE', '2 × AI Engineer', 'Prompt Engineer', 'Eval Specialist', 'QA Engineer'],
    tech: ['langgraph', 'aws', 'python', 'grafana'], stack: 'LangGraph · Whisper ASR · Pinecone · Amazon Bedrock · Ragas · Phoenix',
    baseline: '11× more findings surfaced against the same control set.',
  },
  {
    id: 'claims', lead: true, fit: 'Regulated Australian enterprise', sector: 'Same Australian insurer · claims and authorisation intake', lab: 'claims',
    t: 'Claims read, verified and paid before anyone opens them',
    p: 'Claims arrived as mixed, unstructured documents. Classification and extraction were manual, and an earlier robotic automation attempt had failed on the exception path.',
    b: 'Two agents on the same intake. One classifies and extracts across PDFs and images and validates fields against the systems of record. The other checks each policy clause and SOP step before payment. Above a governed confidence threshold claims go straight through; below it a handler gets a fully assembled, cited case.',
    m: [{ v: 'Pre-pay', l: 'SOP check, not post-pay audit' }, { v: '100%', l: 'decisions with a reasoning trail' }, { v: '10 wks', l: 'discovery to go-live' }],
    timeline: [['Discovery', 2], ['Build', 6], ['Hardening', 1], ['Go-live', 1]],
    team: ['Engagement Lead', 'AI FDE', '2 × AI Engineer', 'QA Engineer'],
    tech: ['langgraph', 'aws', 'salesforce', 'datadog'], stack: 'LangGraph · Amazon Bedrock · Salesforce · Amazon S3 · Ragas · Phoenix',
    baseline: 'Straight-through rate and handler time measured against the prior manual first pass.',
  },
  {
    id: 'payer', fit: 'Health', sector: 'Leading US health insurance payer, national scale', lab: 'claims',
    t: 'AI-powered payment integrity and claims',
    p: 'Millions of claims ran through legacy rules engines. Improper payments, coordination-of-benefits errors and manual record review drove leakage and audit exposure.',
    b: 'An agentic pipeline for pre- and post-pay integrity checks, LLM-assisted medical record review with evidence trails, automated COB determination and document intelligence, all traced and guarded.',
    m: [{ v: 'Hours → mins', l: 'manual review time' }, { v: 'Higher', l: 'straight-through rate' }, { v: 'Audit-ready', l: 'reasoning trails' }],
    tech: ['langgraph', 'snowflake', 'python'], stack: 'LangGraph · Google ADK · RAG · Snowflake · FastAPI · Langfuse',
  },
  {
    id: 'network', fit: 'Health', sector: 'US managed-care plan · dual-eligible members', lab: 'shared',
    t: 'Specialty-based provider network assignment',
    p: 'Providers were assigned to networks regardless of their home and community-based service designation, causing directory confusion and member-access errors.',
    b: 'Rules-driven processing that splits long-term-support records into the right networks, aware of Medicare and Medicaid status, reusing existing directory rules for consistency.',
    m: [{ v: 'Accurate', l: 'network reporting to regulators' }, { v: 'Correct', l: 'member to provider matching' }, { v: 'Reused', l: 'existing directory rules' }],
    tech: ['python', 'snowflake'], stack: 'Provider MDM · network configuration · claims adjudication · ETL',
  },
  {
    id: 'reg', fit: 'Health', sector: 'Large US health plan · pharmacy', lab: 'shared',
    t: 'Pharmacy regulatory reporting on one foundation',
    p: 'Regulatory reporting data was scattered across operational, financial and pharmacy systems, with inconsistent definitions and limited traceability.',
    b: 'A central regulatory reporting repository in a GCP data lake, standardised rules and definitions, and lineage and reconciliation built in.',
    m: [{ v: 'Higher', l: 'reporting accuracy' }, { v: 'Full', l: 'lineage and reconciliation' }, { v: 'Less', l: 'manual reporting effort' }],
    tech: ['googlecloud', 'python'], stack: 'GCP data lake · BigQuery · ELT · lineage',
  },
  {
    id: 'cloud', fit: 'Health', sector: 'Major healthcare provider · APAC and EMEA', lab: 'shared',
    t: 'Healthcare cloud and AI modernisation',
    p: 'A fragmented on-prem estate with ageing apps and siloed data. Patient-facing systems suffered downtime and there was no AI-ready foundation.',
    b: 'Phased move to Azure with compliance controls in every layer, a Snowflake data foundation for AI and RAG, observability with auto-healing, and copilots on top.',
    m: [{ v: '40–60%', l: 'less downtime, patient-facing' }, { v: '6 mo', l: 'to a compliant foundation' }, { v: 'Real-time', l: 'observability' }],
    tech: ['azure', 'snowflake', 'kubernetes'], stack: 'Azure AKS · API Management · Snowflake · observability · FinOps',
  },
]

// C1 · indicative starting pod
export const POD = [
  { r: 'Technical Delivery Lead and FDE', n: 1, lvl: 'Senior', loc: 'Melbourne' },
  { r: 'AI Engineer', n: 2, lvl: 'Senior and mid', loc: 'Melbourne' },
  { r: 'Full-stack Engineer', n: 2, lvl: 'Senior and mid', loc: 'Melbourne and blended' },
  { r: 'Integration Engineer', n: 1, lvl: 'Senior', loc: 'Melbourne' },
  { r: 'Data Engineer', n: 1, lvl: 'Senior', loc: 'Blended' },
  { r: 'Test and Assurance Engineer', n: 1, lvl: 'Mid', loc: 'Blended' },
  { r: 'AI Architect (shared across two pods)', n: 1, lvl: 'Senior', loc: 'Melbourne' },
  { r: 'AI Governance and AuthenticAI SME (shared)', n: 1, lvl: 'Senior', loc: 'Blended' },
]

export const RAMP = [
  { w: 'Week 0–1', t: 'Contracting and access', s: 'Delivery lead and AI architect on site in Melbourne, in your ceremonies as observers while onboarding completes.' },
  { w: 'Week 2', t: 'Pairs in your repositories', s: 'Core engineering on site, in your pipelines and tooling, picking up first backlog items beside your engineers.' },
  { w: 'Week 3–4', t: 'Full squad at cadence', s: 'Guardrail and evaluation scaffolding in place, first increment landing in a contained internal workflow.' },
  { w: 'Week 6–8', t: 'Working software', s: 'First release running in your environment, with a baseline agreed with the domain sponsor and product owner.' },
]

// Where a small specialist cell adds the most depth
export const RAISED = [
  { t: 'Agentic and AI-native engineering', s: 'Senior engineers who have taken voice, claims and email agents to production in an Australian insurer, available at short notice.' },
  { t: 'Evaluation, guardrails and governance', s: 'Golden-set gates, lineage and AuthenticAI controls on health data, so every agent can answer why a decision went the way it did.' },
  { t: 'Testing and assurance', s: 'TestKraft for a risk-ranked regression estate, and call or decision assurance that checks every case, not a sample.' },
]

export const SQUAD = [
  { t: 'One backlog', s: 'Prioritised by your product owner. No separate plan and no separate status report.' },
  { t: 'One set of ceremonies', s: 'Attended as squad members, not as a vendor giving an update.' },
  { t: 'One definition of done', s: 'Yours. We adopt your engineering standards and release governance.' },
  { t: 'Transfer through delivery', s: 'Pairing from sprint one. Decision records, runbooks and eval suites written as we go, in your repositories.' },
]

export const COMMIT = [
  { t: 'Open and auditable', s: 'LangGraph orchestration where every path is visible, Phoenix tracing, MCP for tools, standard cloud primitives. Patterns, not licensed black boxes.' },
  { t: 'Your IP, your repositories', s: 'Everything built for Medibank is Medibank’s, developed in Medibank repositories from day one.' },
  { t: 'Australian data residency', s: 'Member and health data stays in Australia. Our voice agent already processes entirely in an AU region in production.' },
]

export const PROOF_POINTS = [
  { v: '1,750+', l: 'consultants globally' },
  { v: '92%', l: 'senior grade or above' },
  { v: '2 wks', l: 'to first engineers on site' },
  { v: '4 wks', l: 'to a full squad at cadence' },
]
