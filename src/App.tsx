import Hero from './components/hero'
import Projects from './components/projects'
import './App.css'
import Marquee from './components/marquee'
import Achievements from './components/achievements'
import Work from './components/work'

function App() {
  return (
    <main className="page">
      <Hero />
      <Marquee/>
      <Work />
      <Achievements />
      <Projects />
    </main>
  )
}

export default App