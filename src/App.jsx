import { useState, useCallback } from 'react';
import { CartProvider } from './components/CartContext.jsx';
import { useReveal, useParallax } from './components/motion.js';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import BurgerGrid from './components/BurgerGrid.jsx';
import EditorialStory from './components/EditorialStory.jsx';
import Categories from './components/Categories.jsx';
import MenuGrid from './components/MenuGrid.jsx';
import Ingredients from './components/Ingredients.jsx';
import PromoBanner from './components/PromoBanner.jsx';
import Testimonials from './components/Testimonials.jsx';
import LocationSection from './components/LocationSection.jsx';
import FinalCTA from './components/FinalCTA.jsx';
import Footer from './components/Footer.jsx';
import OrderDrawer from './components/OrderDrawer.jsx';

export default function App() {
  const [menuFilter, setMenuFilter] = useState('highlights');
  useReveal();
  useParallax();

  // Category tiles + footer links filter the menu grid, then jump to it.
  const showCategory = useCallback((key) => {
    setMenuFilter(key);
    requestAnimationFrame(() =>
      document.getElementById('full-menu')?.scrollIntoView({ behavior: 'smooth' })
    );
  }, []);

  return (
    <CartProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <BurgerGrid />
        <EditorialStory />
        <Categories onSelect={showCategory} />
        <MenuGrid filter={menuFilter} onFilter={setMenuFilter} />
        <Ingredients />
        <PromoBanner />
        <Testimonials />
        <LocationSection />
        <FinalCTA />
      </main>
      <Footer onCategory={showCategory} />
      <OrderDrawer />
    </CartProvider>
  );
}
