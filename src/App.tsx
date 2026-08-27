import Hero from './components/hero'
import Marquee from './components/marquee'
import Projects from './components/projects'
import './App.css'

function App() {
  return (
    <main className="page">
      <Hero />
      <Marquee />
      <Projects />
    </main>
  )
}

export default App