import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function FloatingCart() {
  const { cart, openDrawer } = useCart();
  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const [bump, setBump] = useState(false);
  const prevTotal = useRef(totalItems);

  useEffect(() => {
    if (totalItems > prevTotal.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prevTotal.current = totalItems;
      return () => clearTimeout(t);
    }
    prevTotal.current = totalItems;
  }, [totalItems]);

  return (
    <button
      onClick={openDrawer}
      aria-label="Abrir carrito"
      /*
        - `bottom-20` (80px) en pantallas pequeñas para quedar por ENCIMA de WhatsApp
        - `sm:bottom-6` (24px) en computadoras para volver a su posición original
      */
      className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#C4A278] text-bib-black p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 ${
        bump ? 'scale-110' : ''
      }`}
    >
      <div className="relative">
        <ShoppingCart size={20} className="sm:hidden" />
        <ShoppingCart size={24} className="hidden sm:block" />

        {totalItems > 0 && (
          <span
            className={`absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 bg-bib-black text-[#C4A278] border border-[#C4A278] text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold transition-transform duration-300 ${
              bump ? 'scale-125' : 'scale-100'
            }`}
          >
            {totalItems}
          </span>
        )}
      </div>
    </button>
  );
}