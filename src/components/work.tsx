import { useEffect, useRef } from 'react'
import './work.css'

/* ------------------------------------------------------------------ */
/* Data — swap in your real experience here                            */
/* ------------------------------------------------------------------ */

interface Entry {
  title: string
  company: string
  dates: string
  location?: string
  description: string
  tags?: string[]
  achievement?: boolean
  current?: boolean
}

interface YearGroup {
  year: string
  entries: Entry[]
}

const TIMELINE: YearGroup[] = [
  {
    year: '2026',
    entries: [
      {
        title: 'Software Development Intern',
        company: 'IndiaMART InterMESH',
        dates: 'June 2026 – July 2026',
        location: 'Delhi',
        description: 'Built AI-powered call quality systems, pushing accuracy from 89% to 98.5%.',
        tags: ['Go', 'FastAPI', 'LLM-as-a-Judge', 'Langfuse', 'OpenTelemetry', 'BigQuery', 'GPU Deployment'],
        current: true,
      },
    ],
  },
  {
    year: '2025',
    entries: [
      {
        title: 'Selected Participant',
        company: 'Amazon ML Summer School',
        dates: 'June–July 2025 · June–July 2026',
        description: "Selected for two consecutive annual cohorts of Amazon's intensive ML program.",
        achievement: true,
      },
      {
        title: 'Machine Learning Intern',
        company: 'Qriocity',
        dates: 'November 2025 – January 2026',
        location: 'Chennai',
        description: 'Built ML pipelines that reduced analysis turnaround time by 30%.',
      },
    ],
  },
  {
    year: '2024',
    entries: [
      {
        title: 'Chairperson',
        company: 'IEEE IIIT Bhopal Student Branch',
        dates: 'October 2024 – October 2025',
        location: 'Bhopal',
        description: 'Led the IEEE chapter — technical initiatives, workshops, community growth.',
      },
      {
        title: 'Teaching Assistant',
        company: 'IIIT Bhopal',
        dates: 'July 2024 – November 2024',
        location: 'Bhopal',
        description: 'Mentored students in Fundamentals of Computer Programming.',
      },
      {
        title: 'UI/UX Designer',
        company: 'GamersTag',
        dates: 'May 2024 – June 2024',
        location: 'Kochi, Kerala',
        description: 'Shaped the visual identity and UX for a gaming community platform.',
      },
    ],
  },
]

const HIGHLIGHT = {
  initials: 'IM',
  name: 'IndiaMART InterMESH',
  location: 'Delhi',
  description:
    'Engineered a Go-based AI Auditor for PNS Call Summary quality — pushing accuracy from 89% to 98.5% using LLM-as-a-Judge with Langfuse-managed prompts. Built intent-based Suggestive Replies and an Actionable Suggestions embeddings/clustering model. Deployed GPU-backed FastAPI/Uvicorn workers with OpenTelemetry + Kibana observability, benchmarked on 5,000+ production-like cases using BigQuery.',
}

const GLOBE_PINS = [
  { x: '38%', y: '34%', color: '#4aa8ff' },
  { x: '58%', y: '58%', color: '#3ddc84' },
  { x: '48%', y: '46%', color: '#ffb63d' },
]

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function Work() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const targetRef = useRef({ px: 0, py: 0, scroll: 0 })
  const currentRef = useRef({ px: 0, py: 0, scroll: 0 })

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const tick = () => {
      const ease = 0.08
      const cur = currentRef.current
      const tgt = targetRef.current
      cur.px += (tgt.px - cur.px) * ease
      cur.py += (tgt.py - cur.py) * ease
      cur.scroll += (tgt.scroll - cur.scroll) * ease

      section.style.setProperty('--par-x', cur.px.toFixed(4))
      section.style.setProperty('--par-y', cur.py.toFixed(4))
      section.style.setProperty('--scroll-shift', cur.scroll.toFixed(4))

      rafRef.current = requestAnimationFrame(tick)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      targetRef.current.px = x
      targetRef.current.py = y
    }

    const handleMouseLeave = () => {
      targetRef.current.px = 0
      targetRef.current.py = 0
    }

    const handleScroll = () => {
      const rect = section.getBoundingClientRect()
      const viewportCenter = window.innerHeight / 2
      const sectionCenter = rect.top + rect.height / 2
      const distance = (viewportCenter - sectionCenter) / window.innerHeight
      const clamped = Math.max(-1, Math.min(1, distance))
      targetRef.current.scroll = clamped
    }

    handleScroll()
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    section.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('scroll', handleScroll, { passive: true })
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      section.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section className="work" aria-label="Work experience timeline" ref={sectionRef}>
      <div className="work__stars" aria-hidden="true">
        <div className="work__stars-layer work__stars-layer--1" />
        <div className="work__stars-layer work__stars-layer--2" />
        <div className="work__stars-layer work__stars-layer--3" />
      </div>

      <div className="work__inner">
        <header className="work__header">
          <p className="work__eyebrow">
            <span className="work__eyebrow-arrow">&gt;</span> Timeline
          </p>
          <h2 className="work__title">Incredible places I&apos;ve worked at.</h2>
        </header>

        <div className="work__layout">
          <ol className="work__timeline">
            {TIMELINE.map((group) => (
              <li className="work__year-group" key={group.year}>
                <div className="work__year-row">
                  <span className="work__year">{group.year}</span>
                  <span className="work__year-rule" aria-hidden="true" />
                </div>

                <ol className="work__entries">
                  {group.entries.map((entry) => (
                    <li
                      className={`work-entry ${entry.current ? 'work-entry--current' : ''}`}
                      key={entry.title + entry.dates}
                    >
                      <span className="work-entry__marker" aria-hidden="true" />

                      <div className="work-entry__card">
                        <div className="work-entry__row">
                          <h3 className="work-entry__title">{entry.title}</h3>
                          <div className="work-entry__meta">
                            <span className="work-entry__dates">{entry.dates}</span>
                            {entry.location && (
                              <span className="work-entry__location">
                                <span aria-hidden="true">📍</span> {entry.location}
                              </span>
                            )}
                            {entry.achievement && (
                              <span className="work-entry__achievement">
                                <span aria-hidden="true">✦</span> Achievement
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="work-entry__company">{entry.company}</p>
                        <p className="work-entry__desc">{entry.description}</p>

                        {entry.tags && (
                          <div className="work-entry__tags">
                            {entry.tags.map((tag) => (
                              <span className="work-entry__tag" key={tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>

          <aside className="work__sidebar">
            <div className="work__globe-panel">
              <div className="work__globe">
                <span className="work__globe-sphere" />
                <span className="work__globe-grid" />
                {GLOBE_PINS.map((pin, index) => (
                  <span
                    className="work__globe-pin"
                    style={{ left: pin.x, top: pin.y, ['--pin-color' as string]: pin.color }}
                    key={index}
                  >
                    <span className="work__globe-pin-dot" />
                    <span className="work__globe-pin-ring" />
                  </span>
                ))}
              </div>
            </div>

            <div className="work__highlight-card">
              <div className="work__highlight-head">
                <span className="work__highlight-logo">{HIGHLIGHT.initials}</span>
                <div>
                  <p className="work__highlight-name">{HIGHLIGHT.name}</p>
                  <p className="work__highlight-location">
                    <span aria-hidden="true">📍</span> {HIGHLIGHT.location}
                  </p>
                </div>
              </div>
              <p className="work__highlight-desc">{HIGHLIGHT.description}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Work