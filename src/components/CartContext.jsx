import { createContext, useContext, useReducer, useMemo, useCallback, useRef, useState } from 'react';
import { products } from '../data/menu.js';

const CartContext = createContext(null);

function reducer(state, action) {
  const qty = state[action.id] || 0;
  switch (action.type) {
    case 'add':
      return { ...state, [action.id]: qty + 1 };
    case 'dec': {
      const next = { ...state };
      if (qty <= 1) delete next[action.id];
      else next[action.id] = qty - 1;
      return next;
    }
    case 'remove': {
      const next = { ...state };
      delete next[action.id];
      return next;
    }
    case 'clear':
      return {};
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, {});
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  const add = useCallback((id, { open = false } = {}) => {
    dispatch({ type: 'add', id });
    if (open) setOpen(true);
    else {
      clearTimeout(toastTimer.current);
      setToast({ id, name: products[id]?.name, key: Date.now() });
      toastTimer.current = setTimeout(() => setToast(null), 2600);
    }
  }, []);

  const value = useMemo(() => {
    const lines = Object.entries(items).map(([id, qty]) => ({ id, qty, ...products[id] }));
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
      isOpen,
      toast,
      add,
      dec: (id) => dispatch({ type: 'dec', id }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
      open: () => { setToast(null); setOpen(true); },
      close: () => setOpen(false),
      dismissToast: () => setToast(null),
    };
  }, [items, isOpen, toast, add]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
