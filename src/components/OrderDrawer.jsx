import { useEffect, useRef, useState } from 'react';
import { useCart } from './CartContext.jsx';
import { products, formatPrice } from '../data/menu.js';
import Img from './Img.jsx';
import { Arrow, Plus, Minus } from './ui.jsx';
import '../styles/drawer.css';

const quickAdds = ['double', 'smokehouse', 'combo'];

export default function OrderDrawer() {
  const { lines, count, subtotal, isOpen, close, add, dec, remove, clear, toast, open, dismissToast } = useCart();
  const [placed, setPlaced] = useState(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [isOpen, close]);

  useEffect(() => { if (!isOpen) setPlaced(null); }, [isOpen]);

  const checkout = () => {
    setPlaced({ ref: `LB-${Math.floor(1000 + Math.random() * 9000)}`, count, total: subtotal });
    clear();
  };

  return (
    <>
      <div className={`drawer-scrim ${isOpen ? 'is-open' : ''}`} onClick={close} aria-hidden="true" />
      <aside
        className={`drawer ${isOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-hidden={!isOpen}
        inert={isOpen ? undefined : ''}
      >
        <header className="drawer__head">
          <h2 id="drawer-title" className="display">Your order</h2>
          <button ref={closeRef} className="drawer__close" onClick={close} aria-label="Close order">✕</button>
        </header>

        {placed ? (
          <div className="drawer__done">
            <span className="drawer__done-badge">✓</span>
            <p className="display drawer__done-title">It’s on the grill.</p>
            <p>Order <strong>{placed.ref}</strong> · {placed.count} item{placed.count === 1 ? '' : 's'} · {formatPrice(placed.total)}</p>
            <p className="drawer__muted">Pickup at 214 Wythe Ave in about 12 minutes. Bring napkins. Actually, we’ll give you napkins.</p>
            <button className="btn btn--red btn--lg" onClick={close}>Back to the menu</button>
          </div>
        ) : lines.length === 0 ? (
          <div className="drawer__empty">
            <p className="display drawer__empty-title">Your bag is empty.</p>
            <p className="drawer__muted">Bold move. Start with one of these:</p>
            <ul className="drawer__quick">
              {quickAdds.map((id) => (
                <li key={id}>
                  <span className="drawer__thumb"><Img id={products[id].img} fb={products[id].fb} w={160} alt="" sizes="64px" /></span>
                  <span className="drawer__line-name">{products[id].name}<small>{formatPrice(products[id].price)}</small></span>
                  <button className="add-btn" onClick={() => add(id, { open: true })} aria-label={`Add ${products[id].name}`}><Plus /></button>
                </li>
              ))}
            </ul>
            <a className="link-arrow" href="#full-menu" onClick={close}>Browse the full menu <Arrow /></a>
          </div>
        ) : (
          <>
            <ul className="drawer__lines">
              {lines.map((l) => (
                <li key={l.id}>
                  <span className="drawer__thumb"><Img id={l.img} fb={l.fb} w={160} alt="" sizes="64px" /></span>
                  <span className="drawer__line-name">
                    {l.name}
                    <small>{formatPrice(l.price)} each</small>
                    <button className="drawer__remove" onClick={() => remove(l.id)}>Remove</button>
                  </span>
                  <span className="drawer__qty">
                    <button onClick={() => dec(l.id)} aria-label={`One less ${l.name}`}><Minus /></button>
                    <span aria-live="polite">{l.qty}</span>
                    <button onClick={() => add(l.id, { open: true })} aria-label={`One more ${l.name}`}><Plus /></button>
                  </span>
                </li>
              ))}
            </ul>
            <footer className="drawer__foot">
              <div className="drawer__total"><span>Subtotal</span><strong>{formatPrice(Math.round(subtotal * 100) / 100)}</strong></div>
              <p className="drawer__muted">Pickup · Williamsburg · ready in ~12 min</p>
              <button className="btn btn--lime btn--lg drawer__checkout" onClick={checkout}>
                Checkout <Arrow />
              </button>
            </footer>
          </>
        )}
      </aside>

      <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <span className="toast__dot" aria-hidden="true">✓</span>
            <span><strong>{toast.name}</strong> added</span>
            <button className="toast__btn" onClick={open}>View order</button>
            <button className="toast__x" onClick={dismissToast} aria-label="Dismiss">✕</button>
          </>
        )}
      </div>
    </>
  );
}
