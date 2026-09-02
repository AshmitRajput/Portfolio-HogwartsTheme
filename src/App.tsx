import Hero from './components/hero'
import Projects from './components/projects'
import './App.css'
import Marquee from './components/marquee'
import Achievements from './components/achievements'

function App() {
  return (
    <main className="page">
      <Hero />
      <Marquee/>
      <Achievements />
      <Projects />
    </main>
  )
}

export default App