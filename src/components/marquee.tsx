import './marquee.css'

const DEFAULT_ITEMS = [
  'Retrieval-Augmented Generation',
  'Large Language Models',
  'Neural Networks',
  'Agentic Workflows',
  'Prompt Engineering',
  'Vector Databases',
  'Model Fine-Tuning',
]

interface MarqueeProps {
  items?: string[]
}

function Marquee({ items = DEFAULT_ITEMS }: MarqueeProps) {
  // Duplicate the list so the CSS scroll loop has no visible seam
  const track = [...items, ...items]

  return (
    <div className="marquee" role="presentation" aria-hidden="true">
      <div className="marquee__texture marquee__texture--a" />
      <div className="marquee__texture marquee__texture--b" />
      <div className="marquee__track">
        {track.map((item, index) => (
          <span className="marquee__item" key={`${item}-${index}`}>
            {item}
            <span className="marquee__dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default Marquee