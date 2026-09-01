import trophyIcon from '../assets/achievements/trophy-icon.png'
import knightHelmetIcon from '../assets/achievements/knight-helmet.png'
import checklistIcon from '../assets/achievements/checklist-icon.png'
import starIcon from '../assets/achievements/star-icon.png'
import codeIcon from '../assets/achievements/code-icon.png'
import chefHatIcon from '../assets/achievements/chefhat-icon.png'
import trophyBlueIcon from '../assets/achievements/trophy-blue.png'
import trophyGoldIcon from '../assets/achievements/trophy-gold-1.png'
import medalPurpleIcon from '../assets/achievements/medal-purple-3.png'
import communityIcon from '../assets/achievements/community-icon.png'
import mountainsImage from '../assets/achievements/mountains.png'
import './achievements.css'

type Theme = 'blue' | 'green' | 'purple' | 'gold'
type Rarity = 'legendary' | 'epic' | 'rare' | 'unlocked'

interface Stat {
  icon: string
  value: string
  badge?: string
  label: string
  sub: string
  theme: Theme
  progress: number // 0–100
}

interface Achievement {
  icon: string
  title: string
  rarity: Rarity
  description: string
  theme: Theme
  fullWidth?: boolean
}

const RARITY_META: Record<Rarity, { label: string; glyph: string }> = {
  legendary: { label: 'Legendary', glyph: '♛' },
  epic: { label: 'Epic', glyph: '★' },
  rare: { label: 'Rare', glyph: '◆' },
  unlocked: { label: 'Unlocked', glyph: '✓' },
}

const STATS: Stat[] = [
  {
    icon: knightHelmetIcon,
    value: '1900',
    badge: 'KNIGHT',
    label: 'LeetCode Rating',
    sub: 'Top 4.65% | Rank 101',
    theme: 'blue',
    progress: 82,
  },
  {
    icon: checklistIcon,
    value: '500+',
    label: 'Problems Solved',
    sub: 'Across DP, graphs & advanced data structures',
    theme: 'green',
    progress: 70,
  },
  {
    icon: starIcon,
    value: '1684',
    badge: '3 ★',
    label: 'CodeChef Rating',
    sub: 'Ranked 178th globally (35,000+ participants)',
    theme: 'purple',
    progress: 65,
  },
  {
    icon: trophyIcon,
    value: '2',
    label: 'Hackathons Won',
    sub: 'Strategy Sprint + Strategy Blitz Ideathon',
    theme: 'gold',
    progress: 50,
  },
]

const ACHIEVEMENTS: Achievement[] = [
  {
    icon: knightHelmetIcon,
    title: 'LeetCode – Knight Rank',
    rarity: 'legendary',
    theme: 'blue',
    description:
      'Achieved Knight rank on LeetCode (Rating: 1900), ranking in the Top 4.65% globally (Rank 101).',
  },
  {
    icon: codeIcon,
    title: '500+ Problems Solved',
    rarity: 'unlocked',
    theme: 'green',
    description:
      'Solved 500+ problems across DP, graphs, and advanced data structures across various platforms.',
  },
  {
    icon: chefHatIcon,
    title: 'CodeChef Starters',
    rarity: 'epic',
    theme: 'purple',
    description:
      'Ranked 178th globally among 35,000+ participants in CodeChef Starters, earning a 3-Star rating (1684).',
  },
  {
    icon: trophyBlueIcon,
    title: 'Strategy Sprint, Techkriti 2024',
    rarity: 'rare',
    theme: 'blue',
    description:
      'Secured 2nd place at Strategy Sprint, Techkriti 2024, IIT Kanpur, competing against 250+ teams.',
  },
  {
    icon: trophyGoldIcon,
    title: 'Strategy Blitz Ideathon',
    rarity: 'epic',
    theme: 'gold',
    description: 'Won 1st place at Strategy Blitz Ideathon, among 100+ participating teams.',
  },
  {
    icon: medalPurpleIcon,
    title: 'College ICPC 2025',
    rarity: 'rare',
    theme: 'purple',
    description: 'Secured 3rd place at College ICPC 2025.',
  },
  {
    icon: communityIcon,
    title: 'Led Developer Community & AWS Hackathon',
    rarity: 'legendary',
    theme: 'green',
    fullWidth: true,
    description:
      'Led a 30-member developer team and scaled the community to 700+ developers while organizing an AWS-backed hackathon with 2,300+ participants and 187+ submissions.',
  },
]

function Achievements() {
  return (
    <section className="achievements" aria-label="Achievements">
      <div className="achievements__stars" aria-hidden="true">
        <div className="achievements__stars-layer achievements__stars-layer--1" />
        <div className="achievements__stars-layer achievements__stars-layer--2" />
      </div>

      <div className="achievements__frame">
        <span className="achievements__corner achievements__corner--tl" aria-hidden="true" />
        <span className="achievements__corner achievements__corner--tr" aria-hidden="true" />
        <span className="achievements__corner achievements__corner--bl" aria-hidden="true" />
        <span className="achievements__corner achievements__corner--br" aria-hidden="true" />

        <header className="achievements__header">
          <div className="achievements__title-group">
            <img src={trophyIcon} className="achievements__title-icon" alt="" aria-hidden="true" />
            <div>
              <h2 className="achievements__title">Achievements</h2>
              <p className="achievements__breadcrumb">
                <span className="achievements__breadcrumb-arrow">&gt;</span> Milestones
                <span className="achievements__breadcrumb-sep">/</span> Impact
                <span className="achievements__breadcrumb-sep">/</span> Growth
              </p>
            </div>
          </div>
          <div className="achievements__tagline">
            <p>Same player.</p>
            <p>Bigger quests.</p>
          </div>
        </header>

        <div className="achievements__stats" role="list">
          {STATS.map((stat) => (
            <div className={`stat-card stat-card--${stat.theme}`} role="listitem" key={stat.label}>
              <div className="stat-card__top">
                <span className="stat-card__icon-box">
                  <img src={stat.icon} alt="" aria-hidden="true" />
                </span>
                <div className="stat-card__value-row">
                  <span className="stat-card__value">{stat.value}</span>
                  {stat.badge && <span className="stat-card__badge">{stat.badge}</span>}
                </div>
              </div>
              <p className="stat-card__label">{stat.label}</p>
              <p className="stat-card__sub">{stat.sub}</p>
              <div className="stat-card__bar-track">
                <div className="stat-card__bar-fill" style={{ width: `${stat.progress}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="achievements__section-heading">
          <span className="achievements__flag" aria-hidden="true">
            ⚑
          </span>
          <h3>Achievements Unlocked</h3>
          <span className="achievements__heading-rule" aria-hidden="true" />
          <span className="achievements__heading-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className="achievements__grid">
          {ACHIEVEMENTS.map((item) => {
            const meta = RARITY_META[item.rarity]
            return (
              <article
                className={`achv-card achv-card--${item.theme} ${
                  item.fullWidth ? 'achv-card--full' : ''
                }`}
                key={item.title}
              >
                <span className="achv-card__icon-box">
                  <img src={item.icon} alt="" aria-hidden="true" />
                </span>
                <div className="achv-card__body">
                  <div className="achv-card__row">
                    <h4 className="achv-card__title">{item.title}</h4>
                    <span className={`achv-card__badge achv-card__badge--${item.rarity}`}>
                      <span className="achv-card__badge-glyph">{meta.glyph}</span>
                      {meta.label}
                    </span>
                  </div>
                  <p className="achv-card__desc">{item.description}</p>
                </div>
              </article>
            )
          })}
        </div>

        <img
          src={mountainsImage}
          className="achievements__mountains"
          alt=""
          aria-hidden="true"
        />
      </div>
    </section>
  )
}

export default Achievements