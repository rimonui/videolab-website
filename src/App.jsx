import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Logos from './components/Logos.jsx';
import Loop from './components/Loop.jsx';
import Features from './components/Features.jsx';
import Proof from './components/Proof.jsx';
import Security from './components/Security.jsx';
import Statement from './components/Statement.jsx';
import Footer from './components/Footer.jsx';
import { useReveal } from './components/motion.js';

export default function App() {
  useReveal();
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Logos />
        <Loop />
        <Features />
        <Proof />
        <div className="dark-zone">
          <Security />
          <Statement />
          <Footer />
        </div>
      </main>
    </>
  );
}
