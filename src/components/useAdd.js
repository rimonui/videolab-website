import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from './CartContext.jsx';

/* Adds an item and briefly flips the button into an "added" state. */
export function useAdd(id) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const onAdd = useCallback(() => {
    add(id);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  }, [add, id]);
  return [added, onAdd];
}
