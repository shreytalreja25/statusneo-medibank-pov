import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const GOLD = new THREE.Color('#fac400')
const INK = new THREE.Color('#141414')
const BLUE = new THREE.Color('#00a3e0')
const GREEN = new THREE.Color('#188038')
const DIM = new THREE.Color('#b9ae99')

export const STEP = 2.6 // seconds per rung

function dotTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.3, 'rgba(255,255,255,.85)')
  r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 64, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

// count: number of named rungs (agents)
export function createHelixScene(host, { count = 6, onFrame, onPick } = {}) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x000000, 0)
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog('#f2efe8', 18, 34)
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
  camera.position.set(1.2, 3.0, 16.5)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0)
  controls.enableZoom = false
  controls.enablePan = false
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minPolarAngle = Math.PI * 0.3
  controls.maxPolarAngle = Math.PI * 0.62
  controls.minAzimuthAngle = -0.9
  controls.maxAzimuthAngle = 0.9
  controls.rotateSpeed = 0.5

  const tex = dotTexture()
  const L = 12.5, R = 1.6, TURNS = 2
  const group = new THREE.Group()
  group.rotation.z = 0.18
  scene.add(group)

  // point on strand s (0 member, 1 enterprise) at u in [0,1], with spin phase
  const pt = (u, s, spin, out = new THREE.Vector3()) => {
    const a = u * TURNS * Math.PI * 2 + spin + s * Math.PI
    return out.set((u - 0.5) * L, Math.cos(a) * R, Math.sin(a) * R)
  }

  // strands as tubes rebuilt each frame would be costly; use point clouds that we move
  const N = 360
  const strandGeo = [0, 1].map(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); return g })
  const strandMat = [
    new THREE.PointsMaterial({ size: 0.13, map: tex, vertexColors: true, transparent: true, depthWrite: false }),
    new THREE.PointsMaterial({ size: 0.13, map: tex, vertexColors: true, transparent: true, depthWrite: false }),
  ]
  strandGeo.forEach((g, i) => group.add(new THREE.Points(g, strandMat[i])))
  const lineGeo = [0, 1].map(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); return g })
  group.add(new THREE.Line(lineGeo[0], new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.55 })))
  group.add(new THREE.Line(lineGeo[1], new THREE.LineBasicMaterial({ color: '#e0a800', transparent: true, opacity: 0.85 })))

  // base pairs: faint rungs everywhere, named rungs for agents
  const PAIRS = 44
  const pairGeo = new THREE.BufferGeometry()
  pairGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PAIRS * 6), 3))
  group.add(new THREE.LineSegments(pairGeo, new THREE.LineBasicMaterial({ color: DIM, transparent: true, opacity: 0.55 })))
  const named = Array.from({ length: count }, (_, i) => 0.12 + (i / (count - 1)) * 0.76)
  const rungs = named.map(() => {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.6 }))
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), new THREE.MeshBasicMaterial({ color: INK }))
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 10, 48), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.9 }))
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: GOLD.clone(), transparent: true, opacity: 0.5, depthWrite: false }))
    glow.scale.setScalar(1.1)
    const mEnd = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: BLUE.clone(), transparent: true, depthWrite: false }))
    const eEnd = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: GOLD.clone(), transparent: true, depthWrite: false }))
    mEnd.scale.setScalar(0.42); eEnd.scale.setScalar(0.42)
    group.add(line, node, ring, glow, mEnd, eEnd)
    return { line, node, ring, glow, mEnd, eEnd, a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3() }
  })
  // packet travelling member -> agent -> enterprise on the active rung
  const pk = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: BLUE.clone(), transparent: true, depthWrite: false }))
  pk.scale.setScalar(0.55)
  group.add(pk)
  // drifting dust
  {
    const pos = []
    for (let i = 0; i < 260; i++) pos.push((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 8 - 2)
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.06, map: tex, color: '#c9bfac', transparent: true, depthWrite: false })))
  }

  let w = 1, h = 1
  function resize() {
    w = host.clientWidth; h = host.clientHeight
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = w + 'px'
    renderer.domElement.style.height = h + 'px'
    camera.aspect = w / h
    // fit the helix length to the stage width
    camera.fov = w < 700 ? 58 : 36
    camera.position.z = w < 700 ? 17 : 16.5
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)

  // picking: nearest named rung node on screen
  const screen = named.map(() => ({ x: 0, y: 0 }))
  let hoverI = -1
  const nearest = (ev) => {
    const r = renderer.domElement.getBoundingClientRect()
    const mx = ev.clientX - r.left, my = ev.clientY - r.top
    let best = -1, bd = 34
    screen.forEach((p, i) => { const d = Math.hypot(p.x - mx, p.y - my); if (d < bd) { bd = d; best = i } })
    return best
  }
  const onMove = (ev) => { hoverI = nearest(ev); renderer.domElement.style.cursor = hoverI >= 0 ? 'pointer' : '' }
  const onClick = (ev) => { const i = nearest(ev); if (i >= 0) { t0 = clock.getElapsedTime() - i * STEP; onPick && onPick(i) } }
  renderer.domElement.addEventListener('pointermove', onMove)
  renderer.domElement.addEventListener('click', onClick)

  const clock = new THREE.Clock()
  let raf = 0, last = -1, t0 = 0
  const v = new THREE.Vector3(), tmp = new THREE.Vector3()

  function frame() {
    const el = clock.getElapsedTime()
    const T = el - t0
    const spin = reduce ? 0.6 : el * 0.22
    const active = Math.floor(T / STEP) % count
    const u = (T % STEP) / STEP

    // strands
    for (let s = 0; s < 2; s++) {
      const P = strandGeo[s].attributes.position.array, C = strandGeo[s].attributes.color.array, Lp = lineGeo[s].attributes.position.array
      const base = s === 0 ? INK : GOLD
      for (let i = 0; i < N; i++) {
        const uu = i / (N - 1)
        pt(uu, s, spin, v)
        P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z
        Lp[i * 3] = v.x; Lp[i * 3 + 1] = v.y; Lp[i * 3 + 2] = v.z
        // depth shading and flowing pulses along the strand
        const depth = 0.55 + 0.45 * ((v.z + R) / (2 * R))
        const flow = Math.max(0, Math.sin((uu * 26 - el * (s ? 1.6 : 1.2)) * 1.0)) ** 8
        const c = tmp.set(base.r, base.g, base.b)
        C[i * 3] = c.x * depth + flow * 0.4; C[i * 3 + 1] = c.y * depth + flow * 0.35; C[i * 3 + 2] = c.z * depth + flow * 0.1
      }
      strandGeo[s].attributes.position.needsUpdate = true
      strandGeo[s].attributes.color.needsUpdate = true
      lineGeo[s].attributes.position.needsUpdate = true
    }
    // faint base pairs
    {
      const P = pairGeo.attributes.position.array
      for (let i = 0; i < PAIRS; i++) {
        const uu = (i + 0.5) / PAIRS
        pt(uu, 0, spin, v); P[i * 6] = v.x; P[i * 6 + 1] = v.y; P[i * 6 + 2] = v.z
        pt(uu, 1, spin, v); P[i * 6 + 3] = v.x; P[i * 6 + 4] = v.y; P[i * 6 + 5] = v.z
      }
      pairGeo.attributes.position.needsUpdate = true
    }
    // named rungs
    rungs.forEach((r, i) => {
      pt(named[i], 0, spin, r.a); pt(named[i], 1, spin, r.b); r.c.copy(r.a).lerp(r.b, 0.5)
      const g = r.line.geometry.attributes.position.array
      g[0] = r.a.x; g[1] = r.a.y; g[2] = r.a.z; g[3] = r.b.x; g[4] = r.b.y; g[5] = r.b.z
      r.line.geometry.attributes.position.needsUpdate = true
      const on = i === active
      const done = smooth(0.72, 0.85, u) * (on ? 1 : 0)
      r.node.position.copy(r.c); r.ring.position.copy(r.c); r.glow.position.copy(r.c)
      r.mEnd.position.copy(r.a); r.eEnd.position.copy(r.b)
      r.ring.lookAt(camera.position)
      r.ring.scale.setScalar(on ? 1 + Math.sin(el * 6) * 0.08 : 0.75)
      r.ring.material.color.copy(GOLD).lerp(GREEN, done)
      r.node.material.color.copy(on ? GOLD : INK).lerp(GREEN, done)
      r.glow.material.opacity = on ? 0.9 : hoverI === i ? 0.6 : 0.25
      r.glow.scale.setScalar(on ? 1.8 : 1)
      r.line.material.opacity = on ? 1 : 0.5
      r.line.material.color.copy(on ? INK : DIM)
      r.mEnd.scale.setScalar(on ? 0.62 : 0.4); r.eEnd.scale.setScalar(on ? 0.62 : 0.4)
    })
    // packet: member end -> agent (gate) -> enterprise end
    {
      const r = rungs[active]
      const a = smooth(0.05, 0.4, u), b = smooth(0.45, 0.72, u)
      if (b > 0) pk.position.copy(r.c).lerp(r.b, b)
      else pk.position.copy(r.a).lerp(r.c, a)
      pk.material.color.copy(BLUE).lerp(GOLD, b)
      pk.material.opacity = u < 0.9 ? 1 : 0
    }

    controls.update()
    renderer.render(scene, camera)

    const proj = (p) => { v.copy(p).applyMatrix4(group.matrixWorld).project(camera); return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h } }
    rungs.forEach((r, i) => { const p = proj(r.c); screen[i].x = p.x; screen[i].y = p.y })
    if (onFrame) {
      const r = rungs[active]
      const sA = new THREE.Vector3(), sB = new THREE.Vector3()
      pt(0.02, 0, spin, sA); pt(0.02, 1, spin, sB)
      onFrame({
        active, changed: active !== last, u,
        gate: smooth(0.38, 0.48, u), done: smooth(0.72, 0.85, u),
        tags: { m: proj(r.a), c: proj(r.c), e: proj(r.b), sm: proj(sA), se: proj(sB) },
        nodes: screen,
      })
      last = active
    }
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return {
    go(i) { t0 = clock.getElapsedTime() - i * STEP },
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('click', onClick)
      controls.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
