import { useEffect, useRef, useState } from 'react'
import baseImage from '../assets/transparent-base.png'
import flameImage from '../assets/transparent-flame.png'
import CtaButton from './CtaButton'
import './Hero.css'

function Hero() {
  const headlineText = 'I built the mask.'
  const [isReady, setIsReady] = useState(false)
  const flameLayerRef = useRef<HTMLDivElement | null>(null)
  const headlineRef = useRef<HTMLHeadingElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const smoothRef = useRef({ x: 0, y: 0 })
  const loadedRef = useRef(false)
  const hasAnimatedHeadlineRef = useRef(false)

  // Preload both layers before showing real content
  useEffect(() => {
    let isActive = true

    const preloadImage = (source: string) =>
      new Promise<void>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve()
        image.onerror = () => reject(new Error(`Failed to load image: ${source}`))
        image.src = source
      })

    Promise.all([preloadImage(baseImage), preloadImage(flameImage)])
      .then(() => {
        if (!isActive) return
        loadedRef.current = true
        setIsReady(true)
      })
      .catch(() => {
        if (!isActive) return
        loadedRef.current = true
        setIsReady(true)
      })

    return () => {
      isActive = false
    }
  }, [])

  // Cursor tracking + lerp-smoothed spotlight
  useEffect(() => {
    if (!loadedRef.current) return

    const setTargetFromPoint = (x: number, y: number) => {
      targetRef.current = { x, y }
    }

    const setTargetFromTouch = (event: TouchEvent) => {
      const touch = event.touches[0] ?? event.changedTouches[0]
      if (!touch) return
      setTargetFromPoint(touch.clientX, touch.clientY)
    }

    const handleMouseMove = (event: MouseEvent) => {
      setTargetFromPoint(event.clientX, event.clientY)
    }

    const handleTouchStart = (event: TouchEvent) => setTargetFromTouch(event)
    const handleTouchMove = (event: TouchEvent) => setTargetFromTouch(event)

    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    targetRef.current = { x: centerX, y: centerY }
    smoothRef.current = { x: centerX, y: centerY }

    const updateMaskPosition = () => {
      const flameLayer = flameLayerRef.current
      if (!flameLayer) return
      const { x, y } = smoothRef.current
      flameLayer.style.setProperty('--x', `${x}px`)
      flameLayer.style.setProperty('--y', `${y}px`)
    }

    const animate = () => {
      const target = targetRef.current
      const smooth = smoothRef.current

      smooth.x += (target.x - smooth.x) * 0.1
      smooth.y += (target.y - smooth.y) * 0.1

      updateMaskPosition()
      animationFrameRef.current = window.requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    updateMaskPosition()
    animationFrameRef.current = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isReady])

  // Word-by-word headline reveal, once
  useEffect(() => {
    if (!isReady || hasAnimatedHeadlineRef.current) return

    const heading = headlineRef.current
    if (!heading) return

    const words = headlineText.split(' ').filter(Boolean)
    heading.textContent = ''

    words.forEach((word, index) => {
      const wordSpan = document.createElement('span')
      wordSpan.className = 'word-reveal'
      wordSpan.style.animationDelay = `${index * 0.05}s`
      wordSpan.textContent = word
      heading.appendChild(wordSpan)

      if (index < words.length - 1) {
        heading.appendChild(document.createTextNode(' '))
      }
    })

    hasAnimatedHeadlineRef.current = true
  }, [headlineText, isReady])

  return (
    <section className="hero" aria-label="Portfolio hero">
      <div className="hero__layers" aria-hidden="true">
        <div
          className={`hero__layer hero__layer--base ${isReady ? 'is-visible' : ''}`}
          style={{ backgroundImage: `url(${baseImage})` }}
        />
        <div
          ref={flameLayerRef}
          className={`hero__layer hero__layer--flame ${isReady ? 'is-visible' : ''}`}
          style={{ backgroundImage: `url(${flameImage})` }}
        />
        <div className="hero__vignette" />
      </div>

      <div className={`hero__content ${isReady ? 'is-visible' : ''}`}>
        <p className="hero__eyebrow">&gt; whoami</p>
        <h1 ref={headlineRef}>{headlineText}</h1>
        <p className="hero__description">
          AI engineer and tech content creator. Move the cursor across the frame —
          it's the only light source that shows what's underneath.
        </p>
        <div className="hero__actions">
          <CtaButton href="#work" label="View work" />
          <CtaButton href="#contact" label="Contact" className="cta-button--secondary" />
        </div>
      </div>

      <div className={`hero__skeleton ${isReady ? 'is-hidden' : ''}`} aria-hidden="true">
        <div className="hero__skeleton-eyebrow" />
        <div className="hero__skeleton-title" />
        <div className="hero__skeleton-line hero__skeleton-line--wide" />
        <div className="hero__skeleton-line" />
        <div className="hero__skeleton-actions">
          <span />
          <span />
        </div>
      </div>
    </section>
  )
}

export default Hero