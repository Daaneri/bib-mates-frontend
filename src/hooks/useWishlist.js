import { useState, useEffect, useCallback } from 'react';

const WISHLIST_KEY = 'bib_wishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
      setWishlist(saved);
    } catch {
      setWishlist([]);
    }
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isWishlisted = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  return { wishlist, toggleWishlist, isWishlisted };
}