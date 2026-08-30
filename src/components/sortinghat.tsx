import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import sortingHatImage from '../assets/sorting-hat.png'
import './sortinghat.css'

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const HAT_FLOAT_DISTANCE = 14 // px, vertical bob
const HAT_FLOAT_X_DISTANCE = 20 // px, sideways drift
const HAT_FLOAT_DURATION = 7.5
const HAT_TILT_DEGREES = 2.2

// ---------------------------------------------------------------------------
// The word ribbon is a true circle of fixed radius, tilted at a constant
// angle so it reads as an orbiting ring around the hat (like a halo seen
// from a slight angle). Because every word sits at the same radius, equal
// steps in angle are ALWAYS equal steps in arc-length — this is what makes
// spacing stay perfectly even, unlike an ellipse (where equal angles do not
// mean equal distance). No "wave" or manual y-offset hacks are layered on
// top; the only geometry in play is: circle -> fixed tilt -> perspective.
// ---------------------------------------------------------------------------
// Smaller + closer to the hat than before, per feedback — the ring now
// hugs the hat instead of pushing words out to the frame edges.
const RIBBON_RADIUS_RATIO_DESKTOP = 0.64
const RIBBON_RADIUS_RATIO_TABLET = 0.6
const RIBBON_RADIUS_RATIO_MOBILE = 0.78

// Degrees the ring is tilted back from edge-on. Small = a shallow, mostly
// horizontal halo (lots of depth, little vertical spread) — large = a ring
// that faces the viewer more head-on. Kept as ONE fixed constant so the
// path is a single true circle, not a warped/wavy shape. Lowered so the
// ring stays close to the hat's own height instead of arcing far above it.
const RIBBON_TILT_DEG = 12

const RIBBON_SPEED = 0.078 // noticeably faster orbit
// Single pass around the loop (not doubled) — with the smaller radius this
// keeps words legible instead of crowding into each other.
const RIBBON_REPEATS = 1
const RIBBON_MIN_OPACITY = 0.32
const RIBBON_MAX_OPACITY = 1
const RIBBON_MIN_SCALE_X = 0.1 // how thin a word gets when edge-on

// Fixed pixel gap kept between word edges along the ring, regardless of how
// long each word is. Because the ring is a true circle, this gap is applied
// as a proportion of the full circumference — so it stays visually constant
// all the way around instead of drifting. Tightened so words sit closer
// together around the ring.
const RIBBON_WORD_GAP_PX = 22

const PARTICLE_COUNT_DESKTOP = 34
const PARTICLE_COUNT_MOBILE = 14
const SPARK_FLARE_RATIO = 0.28
const SPARK_TRAIL_RATIO = 0.2
const SPARK_COOL_TINT_RATIO = 0.22

// Tight, fast-swirling "spell dust" ring hugging the hat itself.
const AURA_COUNT_DESKTOP = 20
const AURA_COUNT_MOBILE = 10

// Static twinkling starfield behind everything.
const STAR_COUNT_DESKTOP = 80
const STAR_COUNT_MOBILE = 40

// Drifting smoke wisps for atmosphere.
const SMOKE_LAYERS = 5

const PERSPECTIVE_MAX_PARALLAX_X = 10
const PERSPECTIVE_MAX_PARALLAX_Y = 7

const RIBBON_TEXT =
  'ARTIFICIAL INTELLIGENCE • MACHINE LEARNING • RAG • LARGE LANGUAGE MODELS • AI AGENTS • NEURAL NETWORKS • AUTOMATION • COMPUTER VISION •'
const RIBBON_WORDS = RIBBON_TEXT.split(' • ').filter(Boolean)

type NumberRef = { current: number }
type RibbonMetrics = { radius: number; centerY: number }
type MetricsRef = { current: RibbonMetrics }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// Precomputed once — the ring's tilt never changes at runtime.
const RIBBON_TILT_RAD = (RIBBON_TILT_DEG * Math.PI) / 180
const RIBBON_SIN_TILT = Math.sin(RIBBON_TILT_RAD)
const RIBBON_COS_TILT = Math.cos(RIBBON_TILT_RAD)

// A single point on the tilted circle for a given angle. Because x and the
// in-plane radius both use the SAME `radius`, this is a perfect circle —
// not an ellipse — before the fixed tilt is applied to project it into
// screen space (the standard way to draw a 3D ring/orbit).
function ringPoint(angleDeg: number, radius: number, centerY: number) {
  const theta = (angleDeg * Math.PI) / 180
  const x = Math.cos(theta) * radius
  const zNorm = Math.sin(theta) // -1 = far side, +1 = near side
  const y = centerY + zNorm * radius * RIBBON_SIN_TILT
  const z = zNorm * radius * RIBBON_COS_TILT
  return { x, y, z, zNorm }
}

// ---------------------------------------------------------------------------
// Even / weighted angle helpers — pure proportion-of-360, so they work the
// same for any radius. This is what keeps the gap between words visually
// constant all the way around the ring, regardless of word length.
// ---------------------------------------------------------------------------
function buildEvenAngles(count: number): number[] {
  const angles: number[] = []
  for (let i = 0; i < count; i++) angles.push((i / count) * 360)
  return angles
}

function buildWeightedAngles(weightsPx: number[], gapPx: number): number[] {
  const total = weightsPx.reduce((a, b) => a + b, 0) + gapPx * weightsPx.length
  if (!total) return buildEvenAngles(weightsPx.length)
  const degPerPx = 360 / total
  let cursor = 0
  const angles: number[] = []
  for (let i = 0; i < weightsPx.length; i++) {
    const center = cursor + weightsPx[i] / 2
    angles.push(center * degPerPx)
    cursor += weightsPx[i] + gapPx
  }
  return angles
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
function usePrefersReducedMotion() {
  const ref = useRef(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    ref.current = query.matches
    const handler = (e: MediaQueryListEvent) => {
      ref.current = e.matches
    }
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])
  return ref
}

function useResponsiveCount(desktop: number, mobile: number) {
  const ref = useRef(desktop)
  useEffect(() => {
    const update = () => {
      ref.current = window.innerWidth <= 600 ? mobile : desktop
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [desktop, mobile])
  return ref.current
}

function useRibbonMetrics(rootRef: { current: HTMLDivElement | null }): MetricsRef {
  const metricsRef = useRef<RibbonMetrics>({ radius: 1, centerY: 0 })

  useEffect(() => {
    const update = () => {
      const width = rootRef.current?.clientWidth ?? window.innerWidth
      const ratio =
        width <= 600 ? RIBBON_RADIUS_RATIO_MOBILE : width <= 900 ? RIBBON_RADIUS_RATIO_TABLET : RIBBON_RADIUS_RATIO_DESKTOP

      metricsRef.current = { radius: (width * ratio) / 2, centerY: 0 }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [rootRef])

  return metricsRef
}

// ---------------------------------------------------------------------------
// The single continuous 3D ribbon — a true circle of words orbiting the hat
// ---------------------------------------------------------------------------
interface ChunkEntry {
  el: HTMLSpanElement
  angleOffset: number
}

function Ribbon({ angleRef, metricsRef }: { angleRef: NumberRef; metricsRef: MetricsRef }) {
  const chunkRefs = useRef<ChunkEntry[]>([])

  const words = useMemo(() => {
    const list: string[] = []
    for (let r = 0; r < RIBBON_REPEATS; r++) RIBBON_WORDS.forEach((w) => list.push(w))
    return list
  }, [])

  // Fallback used only until real DOM widths are measured on first paint.
  const evenAngles = useMemo(() => buildEvenAngles(words.length), [words.length])

  // Measure actual rendered chunk widths (word text + dot glyph) and re-derive
  // angleOffsets so every gap between words is the same proportion of the
  // full circle — fixes uneven-looking spacing caused by short vs. long
  // words sharing equal angular slots. Re-measures on resize.
  useEffect(() => {
    let raf: number
    let attempts = 0
    const measure = () => {
      const widths = chunkRefs.current.map((c) => c?.el.offsetWidth || 0)
      const ready = widths.length === words.length && widths.every((w) => w > 0)
      if (!ready && attempts < 30) {
        attempts++
        raf = requestAnimationFrame(measure)
        return
      }
      if (!ready) return
      const weighted = buildWeightedAngles(widths, RIBBON_WORD_GAP_PX)
      chunkRefs.current.forEach((c, i) => {
        if (c) c.angleOffset = weighted[i]
      })
    }
    raf = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [words.length])

  useEffect(() => {
    let raf: number
    const tick = () => {
      const baseAngle = angleRef.current
      const { radius, centerY } = metricsRef.current

      chunkRefs.current.forEach((chunk) => {
        if (!chunk) return
        const angleDeg = baseAngle + chunk.angleOffset
        const { x, y, z, zNorm } = ringPoint(angleDeg, radius, centerY)

        // Orientation tied to the same angle driving position — words face
        // the viewer at the front of the ring and go edge-on at the sides.
        const rotY = angleDeg - 90
        const rotYRad = (rotY * Math.PI) / 180
        const scaleX = Math.max(RIBBON_MIN_SCALE_X, Math.abs(Math.cos(rotYRad)))

        const depth01 = (zNorm + 1) / 2
        const opacity = lerp(RIBBON_MIN_OPACITY, RIBBON_MAX_OPACITY, depth01)
        const blur = zNorm < -0.25 ? lerp(1.6, 0, depth01 / 0.35) : 0
        const zIndex = Math.round(depth01 * 20)

        chunk.el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotY}deg) scaleX(${scaleX})`
        chunk.el.style.opacity = String(opacity)
        chunk.el.style.filter = blur > 0.05 ? `blur(${blur}px)` : 'none'
        chunk.el.style.zIndex = String(zIndex)
      })

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [angleRef, metricsRef])

  return (
    <div className="shm__ribbon" aria-hidden="true">
      {words.map((word, i) => (
        <span
          key={`w-${i}`}
          ref={(el) => {
            if (el) chunkRefs.current[i] = { el, angleOffset: evenAngles[i] }
          }}
          className="shm__chunk"
        >
          {word}
          <span className="shm__chunk-dot">•</span>
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Fairy-dust glitter riding the same true-circle ring
// ---------------------------------------------------------------------------
function RibbonGlitter({ angleRef, metricsRef, count }: { angleRef: NumberRef; metricsRef: MetricsRef; count: number }) {
  const particleRefs = useRef<{ el: HTMLSpanElement; angleOffset: number; radialJitter: number; speedMul: number; size: number }[]>([])

  const evenAngles = useMemo(() => buildEvenAngles(count), [count])

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        angleOffset: evenAngles[i] + (Math.random() * 20 - 10),
        radialJitter: 0.8 + Math.random() * 0.35,
        speedMul: 0.85 + Math.random() * 0.3,
        size: 1.6 + Math.random() * 2.4,
        flare: Math.random() < SPARK_FLARE_RATIO,
        flareDelay: -(Math.random() * 3),
        trail: Math.random() < SPARK_TRAIL_RATIO,
        cool: Math.random() < SPARK_COOL_TINT_RATIO,
        bobPhase: Math.random() * Math.PI * 2,
        bobSpeed: 0.4 + Math.random() * 0.6,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.8 + Math.random() * 1.4,
      })),
    [count, evenAngles]
  )

  useEffect(() => {
    let raf: number
    let t = 0
    const tick = () => {
      t += 0.016
      const baseAngle = angleRef.current
      const { radius, centerY } = metricsRef.current

      particleRefs.current.forEach((p, i) => {
        if (!p) return
        const cfg = particles[i]
        const angleDeg = baseAngle * p.speedMul + p.angleOffset
        const { x, y: ringY, z, zNorm } = ringPoint(angleDeg, radius * p.radialJitter, centerY)
        const bob = Math.sin(t * cfg.bobSpeed + cfg.bobPhase) * 6
        const y = ringY + bob

        const depth01 = (zNorm + 1) / 2
        const twinkle = 0.55 + 0.45 * Math.sin(t * cfg.twinkleSpeed + cfg.twinklePhase)
        const opacity = lerp(0.15, 0.9, depth01) * twinkle
        const scale = 0.75 + twinkle * 0.5
        const zIndex = Math.round(depth01 * 20)

        p.el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`
        p.el.style.opacity = String(opacity)
        p.el.style.zIndex = String(zIndex)
      })

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [angleRef, metricsRef, particles])

  return (
    <div className="shm__glitter" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          ref={(el) => {
            if (el)
              particleRefs.current[p.id] = {
                el,
                angleOffset: p.angleOffset,
                radialJitter: p.radialJitter,
                speedMul: p.speedMul,
                size: p.size,
              }
          }}
          className={[
            'shm__spark',
            p.flare ? 'shm__spark--flare' : '',
            p.trail ? 'shm__spark--trail' : '',
            p.cool ? 'shm__spark--cool' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            {
              width: `${p.trail ? p.size * 3.5 : p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.flare ? `${p.flareDelay}s` : undefined,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tight swirling dust ring around the hat — reads as an active spell rather
// than particles simply riding the far-out word ribbon.
// ---------------------------------------------------------------------------
interface AuraEntry {
  el: HTMLSpanElement
  angle: number
  speed: number
  radiusRatio: number
  bobPhase: number
  bobSpeed: number
  twinklePhase: number
  twinkleSpeed: number
}

function HatAura({ metricsRef, count }: { metricsRef: MetricsRef; count: number }) {
  const auraRefs = useRef<AuraEntry[]>([])

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (i / count) * 360 + Math.random() * 18,
        speed: 0.55 + Math.random() * 0.85,
        radiusRatio: 0.16 + Math.random() * 0.26,
        bobPhase: Math.random() * Math.PI * 2,
        bobSpeed: 0.5 + Math.random() * 0.7,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.9 + Math.random() * 1.5,
        size: 1.3 + Math.random() * 2,
        cool: Math.random() < 0.32,
      })),
    [count]
  )

  useEffect(() => {
    let raf: number
    let t = 0
    const tick = () => {
      t += 0.016
      const { radius } = metricsRef.current

      auraRefs.current.forEach((p, i) => {
        if (!p) return
        const cfg = particles[i]
        const angleDeg = t * 42 * p.speed + p.angle
        const orbitR = radius * p.radiusRatio
        const { x, y: ringY, z, zNorm } = ringPoint(angleDeg, orbitR, 0)
        const bob = Math.sin(t * p.bobSpeed + p.bobPhase) * (orbitR * 0.16)
        const y = ringY + bob

        const depth01 = (zNorm + 1) / 2
        const twinkle = 0.5 + 0.5 * Math.sin(t * p.twinkleSpeed + p.twinklePhase)
        const opacity = lerp(0.3, 1, depth01) * lerp(0.55, 1, twinkle)
        const scale = lerp(0.7, 1.3, twinkle)

        p.el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`
        p.el.style.opacity = String(opacity)
        p.el.style.zIndex = String(Math.round(depth01 * 20))
      })

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [metricsRef, particles])

  return (
    <div className="shm__aura" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={p.id}
          ref={(el) => {
            if (el)
              auraRefs.current[i] = {
                el,
                angle: p.angle,
                speed: p.speed,
                radiusRatio: p.radiusRatio,
                bobPhase: p.bobPhase,
                bobSpeed: p.bobSpeed,
                twinklePhase: p.twinklePhase,
                twinkleSpeed: p.twinkleSpeed,
              }
          }}
          className={['shm__spark', p.cool ? 'shm__spark--cool' : ''].filter(Boolean).join(' ')}
          style={{ width: `${p.size}px`, height: `${p.size}px` }}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Static twinkling starfield, matching the hero section above
// ---------------------------------------------------------------------------
function Stars({ count }: { count: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 1.8,
        big: Math.random() < 0.15,
        duration: 2.4 + Math.random() * 3.6,
        delay: -(Math.random() * 5),
        minOp: 0.15 + Math.random() * 0.15,
        maxOp: 0.55 + Math.random() * 0.4,
      })),
    [count]
  )

  return (
    <div className="shm__stars" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className={['shm__star', s.big ? 'shm__star--big' : ''].filter(Boolean).join(' ')}
          style={
            {
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              '--dur': `${s.duration}s`,
              '--delay': `${s.delay}s`,
              '--min-op': s.minOp,
              '--max-op': s.maxOp,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Drifting smoke wisps — pure CSS-driven, randomized once per mount so the
// layout feels organic rather than mechanically repeated.
// ---------------------------------------------------------------------------
function Smoke({ layers }: { layers: number }) {
  const wisps = useMemo(
    () =>
      Array.from({ length: layers }, (_, i) => ({
        id: i,
        top: 30 + Math.random() * 45,
        left: 15 + Math.random() * 70,
        width: 38 + Math.random() * 26,
        height: 55 + Math.random() * 30,
        duration: 16 + Math.random() * 10,
        delay: -(Math.random() * 12),
        cool: i % 2 === 0,
      })),
    [layers]
  )

  return (
    <div className="shm__smoke" aria-hidden="true">
      {wisps.map((w) => (
        <span
          key={w.id}
          className={['shm__smoke-wisp', w.cool ? 'shm__smoke-wisp--cool' : ''].filter(Boolean).join(' ')}
          style={
            {
              top: `${w.top}%`,
              left: `${w.left}%`,
              width: `${w.width}%`,
              height: `${w.height}%`,
              '--smoke-duration': `${w.duration}s`,
              '--smoke-delay': `${w.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function SortingHat() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  const targetParallax = useRef({ x: 0, y: 0 })
  const smoothParallax = useRef({ x: 0, y: 0 })

  const ribbonAngle = useRef(0)
  const reducedMotionRef = usePrefersReducedMotion()
  const metricsRef = useRibbonMetrics(rootRef)
  const particleCount = useResponsiveCount(PARTICLE_COUNT_DESKTOP, PARTICLE_COUNT_MOBILE)
  const auraCount = useResponsiveCount(AURA_COUNT_DESKTOP, AURA_COUNT_MOBILE)
  const starCount = useResponsiveCount(STAR_COUNT_DESKTOP, STAR_COUNT_MOBILE)

  useEffect(() => {
    let raf: number
    let mounted = true

    const handleMouseMove = (e: MouseEvent) => {
      const root = rootRef.current
      if (!root) return
      const rect = root.getBoundingClientRect()
      const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      targetParallax.current = {
        x: Math.max(-1, Math.min(1, relX)) * PERSPECTIVE_MAX_PARALLAX_X,
        y: Math.max(-1, Math.min(1, relY)) * PERSPECTIVE_MAX_PARALLAX_Y,
      }
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const tick = () => {
      if (!mounted) return

      if (!reducedMotionRef.current) {
        ribbonAngle.current += RIBBON_SPEED

        smoothParallax.current.x += (targetParallax.current.x - smoothParallax.current.x) * 0.06
        smoothParallax.current.y += (targetParallax.current.y - smoothParallax.current.y) * 0.06

        if (stageRef.current) {
          stageRef.current.style.transform = `translate3d(${smoothParallax.current.x}px, ${smoothParallax.current.y}px, 0)`
        }
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      mounted = false
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(raf)
    }
  }, [reducedMotionRef])

  return (
    <section className="shm" ref={rootRef} aria-label="Technology orbit">
      <div className="shm__backdrop" aria-hidden="true" />
      <Stars count={starCount} />
      <Smoke layers={SMOKE_LAYERS} />
      <div className="shm__stage" ref={stageRef}>
        <Ribbon angleRef={ribbonAngle} metricsRef={metricsRef} />
        <RibbonGlitter angleRef={ribbonAngle} metricsRef={metricsRef} count={particleCount} />
        <HatAura metricsRef={metricsRef} count={auraCount} />
        <div className="shm__smoke-near" aria-hidden="true" />

        <div className="shm__hat-wrap">
          <div className="shm__hat-glow" />
          <img
            src={sortingHatImage}
            alt=""
            aria-hidden="true"
            className="shm__hat"
            style={
              {
                '--hat-float-distance': `${HAT_FLOAT_DISTANCE}px`,
                '--hat-float-x': `${HAT_FLOAT_X_DISTANCE}px`,
                '--hat-float-duration': `${HAT_FLOAT_DURATION}s`,
                '--hat-tilt': `${HAT_TILT_DEGREES}deg`,
              } as CSSProperties
            }
          />
        </div>
      </div>
    </section>
  )
}

export default SortingHat