import Hero from './components/hero'
import Projects from './components/projects'
import './App.css'
import Marquee from './components/marquee'

function App() {
  return (
    <main className="page">
      <Hero />
      <Marquee/>
      <Projects />
    </main>
  )
}

export default App