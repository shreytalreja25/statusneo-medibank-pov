# StatusNeo × Medibank · The Agent Studio

Interactive companion to StatusNeo's response to Medibank RFI WS3251614808 (AI Delivery Partner).

- 3D double-helix hero: the member journey (Marketing & Sales Effectiveness) and Enterprise Services, joined by agents as rungs
- Agent Studio: five runnable agents on synthetic data, each with a live governance feed, approvals and a hash-chained ledger
  1. Callback voice agent (eligibility gate, no offer tool, warm transfer on distress)
  2. Claims intake (multimodal classify, clause-by-clause SOP verify, threshold replay)
  3. Follow-up email (six agents, deterministic gate, fails closed, lineage)
  4. Call assurance (obligation-by-obligation, analyst confirm/override, 2% vs 100%)
  5. Shared-services agent (Finance, HR, IT, Procurement through one gateway; slow, down and lost-write faults)
- The brief and Medibank values, the framework and control rail, the reuse map, proof (incl. health), the squad model

```
npm install
npm run dev
npm run build      # Vercel: Vite preset, output dist
npm run qa         # screenshots every section and runs every lab
```

All lab data is synthetic. No Medibank data is used.
