import './CtaButton.css'

type CtaButtonProps = {
  href: string
  label: string
  className?: string
}

function CtaButton({ href, label, className = '' }: CtaButtonProps) {
  const classes = ['cta-button', className].filter(Boolean).join(' ')

  return (
    <a className={classes} href={href}>
      <span className="cta-button__fill" aria-hidden="true" />
      <span className="cta-button__text">{label}</span>
      <span className="cta-button__icon" aria-hidden="true">
        <svg viewBox="0 0 20 20" focusable="false" role="presentation">
          <path
            d="M4.5 10h9.2M10.8 4.8 16 10l-5.2 5.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  )
}

export default CtaButton
