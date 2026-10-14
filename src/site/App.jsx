import { useCallback, useEffect, useState } from 'react'
import { SNLogo, MedibankLogo } from '../ui.jsx'
import Hero from './Hero.jsx'
import Studio from '../studio/Studio.jsx'
import { Brief, Framework, Reuse, Cases, CaseModal, Squad, Ask, Footer } from './Sections.jsx'

const NAV = [
  ['brief', 'I', 'The brief'], ['studio', 'II', 'Agent Studio'], ['framework', 'III', 'Framework'], ['reuse', 'IV', 'Reuse'],
  ['cases', 'V', 'Proof'], ['squad', 'VI', 'Your squad'], ['ask', 'VII', 'Team'],
]

function Header() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [on, setOn] = useState('')
  const [prog, setProg] = useState(0)
  useEffect(() => {
    const f = () => {
      setSolid(window.scrollY > 20)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProg(max > 0 ? window.scrollY / max : 0)
      let cur = ''
      NAV.forEach(([id]) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) cur = id })
      setOn(cur)
    }
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  return (
    <header className={`hdr ${solid ? 'solid' : ''} ${open ? 'open' : ''}`}>
      <div className="hdr-in">
        <a href="#top" className="hdr-logo" onClick={() => setOpen(false)}><SNLogo h={22} /><i>×</i><MedibankLogo h={19} /></a>
        <nav>{NAV.map(([id, n, l]) => <a key={id} href={`#${id}`} className={on === id ? 'on' : ''} onClick={() => setOpen(false)}><i>{n}</i>{l}</a>)}</nav>
        <a href="#ask" className="btn gold sm hdr-cta">Meet the squad</a>
        <button className="hdr-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}><i /><i /></button>
      </div>
      <div className="hdr-prog" style={{ transform: `scaleX(${prog})` }} />
    </header>
  )
}

export default function App() {
  const [caseId, setCaseId] = useState(null)
  const close = useCallback(() => setCaseId(null), [])
  const toLab = (k) => {
    setCaseId(null)
    window.dispatchEvent(new CustomEvent('studio:open', { detail: k }))
    document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Brief />
        <Studio onCase={setCaseId} />
        <Framework />
        <Reuse />
        <Cases onCase={setCaseId} />
        <Squad />
        <Ask />
      </main>
      <Footer />
      {caseId && <CaseModal id={caseId} onClose={close} onLab={toLab} />}
    </>
  )
}
