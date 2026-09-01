import { useEffect, useRef, useState } from 'react'
import heroGif from '../assets/hero.gif'
import CtaButton from './CtaButton'
import './hero.css'

const INTRO_LINES = [
  'Hey! Looking for somebody that can do it all?',
  'You are at the right place!',
]

const FINAL_GREETING = "Hi! I am Ashmit Rajput, final year student at IIIT Bhopal"

const STATIC_PREFIX = 'I am '

// Roles in the order they should cycle. Grammar (a/an) is derived per role
// below, so this list only needs the plain role names.
const ROLES = [
  'Software Developer',
  'DevOps Engineer',
  'Fullstack Developer',
  'UI/UX Designer',
  'AI Engineer',
  'Effective Communicator',
  'Team Player',
  'Problem Solver',
]

// Roles that read better with "an" instead of "a".
const AN_ROLES = new Set(['AI Engineer', 'Effective Communicator'])

const articleFor = (role: string) => (AN_ROLES.has(role) ? 'an' : 'a')
const phraseFor = (role: string) => `${articleFor(role)} ${role}`

const TYPE_SPEED = 65
const DELETE_SPEED = 25
const HOLD_INTRO_LINE = 1300
const HOLD_FINAL_GREETING = 850
const HOLD_AFTER_ROLE = 1300
const HOLD_BETWEEN_STEPS = 320

const SR_SUMMARY = `${FINAL_GREETING}. ${STATIC_PREFIX}${ROLES.map(phraseFor).join(', ')}.`

function Hero() {
  const [greetingText, setGreetingText] = useState('')
  const [roleText, setRoleText] = useState('')
  const [activeLine, setActiveLine] = useState<1 | 2>(1)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setGreetingText(FINAL_GREETING)
      setRoleText(STATIC_PREFIX + phraseFor(ROLES[0]))
      setActiveLine(2)
      return
    }

    let roleIndex = 0

    const schedule = (fn: () => void, delay: number) => {
      timeoutRef.current = window.setTimeout(fn, delay)
    }

    // --- Phase 1: intro lines, each typed then fully erased ---
    const typeIntroLine = (lineIndex: number, charIndex: number) => {
      const line = INTRO_LINES[lineIndex]
      setGreetingText(line.slice(0, charIndex))
      if (charIndex < line.length) {
        schedule(() => typeIntroLine(lineIndex, charIndex + 1), TYPE_SPEED)
      } else {
        schedule(() => deleteIntroLine(lineIndex, line.length), HOLD_INTRO_LINE)
      }
    }

    const deleteIntroLine = (lineIndex: number, charIndex: number) => {
      const line = INTRO_LINES[lineIndex]
      setGreetingText(line.slice(0, charIndex))
      if (charIndex > 0) {
        schedule(() => deleteIntroLine(lineIndex, charIndex - 1), DELETE_SPEED)
      } else {
        const nextIndex = lineIndex + 1
        if (nextIndex < INTRO_LINES.length) {
          schedule(() => typeIntroLine(nextIndex, 0), HOLD_BETWEEN_STEPS)
        } else {
          schedule(() => typeFinalGreeting(0), HOLD_BETWEEN_STEPS)
        }
      }
    }

    // --- Phase 2: final greeting, typed once and kept on screen ---
    const typeFinalGreeting = (charIndex: number) => {
      setGreetingText(FINAL_GREETING.slice(0, charIndex))
      if (charIndex < FINAL_GREETING.length) {
        schedule(() => typeFinalGreeting(charIndex + 1), TYPE_SPEED)
      } else {
        schedule(() => {
          setActiveLine(2)
          typeStaticPrefix(0)
        }, HOLD_FINAL_GREETING)
      }
    }

    // --- Phase 3: "I am " typed once, then "a/an <role>" cycles forever ---
    const typeStaticPrefix = (charIndex: number) => {
      setRoleText(STATIC_PREFIX.slice(0, charIndex))
      if (charIndex < STATIC_PREFIX.length) {
        schedule(() => typeStaticPrefix(charIndex + 1), TYPE_SPEED)
      } else {
        schedule(() => typeRole(0), TYPE_SPEED)
      }
    }

    const typeRole = (charIndex: number) => {
      const phrase = phraseFor(ROLES[roleIndex])
      setRoleText(STATIC_PREFIX + phrase.slice(0, charIndex))
      if (charIndex < phrase.length) {
        schedule(() => typeRole(charIndex + 1), TYPE_SPEED)
      } else {
        schedule(() => deleteRole(phrase.length), HOLD_AFTER_ROLE)
      }
    }

    const deleteRole = (charIndex: number) => {
      const phrase = phraseFor(ROLES[roleIndex])
      setRoleText(STATIC_PREFIX + phrase.slice(0, charIndex))
      if (charIndex > 0) {
        schedule(() => deleteRole(charIndex - 1), DELETE_SPEED)
      } else {
        roleIndex = (roleIndex + 1) % ROLES.length
        schedule(() => typeRole(0), HOLD_BETWEEN_STEPS)
      }
    }

    schedule(() => typeIntroLine(0, 0), 500)

    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <section className="hero" aria-label="Portfolio hero">
      <div className="hero__bg" style={{ backgroundImage: `url(${heroGif})` }} aria-hidden="true" />
      <div className="hero__overlay" aria-hidden="true" />
      <div className="hero__scanlines" aria-hidden="true" />

      <div className="hero__content">
        <span className="sr-only">{SR_SUMMARY}</span>

        <div className="hero__terminal" aria-hidden="true">
          <div className="hero__terminal-bar">
            <span className="hero__terminal-dot hero__terminal-dot--red" />
            <span className="hero__terminal-dot hero__terminal-dot--yellow" />
            <span className="hero__terminal-dot hero__terminal-dot--green" />
            <span className="hero__terminal-path">ashmit@portfolio:~</span>
          </div>

          <div className="hero__terminal-body">
            <p className="hero__terminal-line">
              <span className="hero__prompt">$</span>
              <span className="hero__terminal-text">{greetingText}</span>
              {activeLine === 1 && <span className="hero__cursor" />}
            </p>
            {activeLine === 2 && (
              <p className="hero__terminal-line">
                <span className="hero__prompt">$</span>
                <span className="hero__terminal-text">{roleText}</span>
                <span className="hero__cursor" />
              </p>
            )}
          </div>
        </div>

        <div className="hero__actions">
          <CtaButton href="#work" label="View work" />
          <CtaButton href="#contact" label="Contact" className="cta-button--secondary" />
        </div>
      </div>
    </section>
  )
}

export default Hero