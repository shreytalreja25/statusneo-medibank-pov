import { useEffect, useRef, useState } from 'react'

// Reveal once when the element first enters the viewport. Never reverses, so scrolling can't break layout.
export function useInView(threshold = 0.05) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [seen, threshold])
  return [ref, seen]
}

// 0 -> 1 over `ms` once `start` becomes true
export function useProgress(start, ms = 1600) {
  const [p, setP] = useState(0)
  useEffect(() => {
    if (!start) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setP(1); return }
    let raf, t0
    const tick = (now) => {
      t0 = t0 ?? now
      const u = Math.min(1, (now - t0) / ms)
      setP(1 - Math.pow(1 - u, 3))
      if (u < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, ms])
  return p
}

export function useMedia(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches
  const [m, setM] = useState(get)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const f = () => setM(mq.matches)
    f()
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [query])
  return m
}

export function useWidth() {
  const ref = useRef(null)
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  return [ref, w]
}
