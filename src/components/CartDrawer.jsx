import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, isDrawerOpen, closeDrawer } = useCart();
  
  // Muestra precio de lista por defecto
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Bloquea el scroll del fondo mientras el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Cierra con la tecla Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') closeDrawer();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeDrawer]);

  return (
    <>
      {/* Overlay oscuro de fondo */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel lateral */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-bib-dark z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-bib-white/10 shrink-0">
          <h2 className="text-sm font-medium text-bib-white uppercase tracking-widest">
            Tu carrito {cart.length > 0 && `(${cart.reduce((a, i) => a + i.quantity, 0)})`}
          </h2>
          <button onClick={closeDrawer} className="text-bib-gray hover:text-bib-white transition-colors" aria-label="Cerrar carrito">
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <ShoppingBag size={32} strokeWidth={1.25} className="text-bib-white/20" />
            <p className="text-bib-gray text-sm">Tu carrito está vacío</p>
            <button onClick={closeDrawer} className="text-bib-red hover:text-bib-white underline text-xs uppercase tracking-widest transition-colors">
              Seguir viendo productos
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-bib-white/10 last:border-0">
                  <img src={item.image_url} alt={item.name} loading="lazy" decoding="async" className="w-16 h-16 object-cover rounded shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm text-bib-white truncate">{item.name}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-bib-gray hover:text-bib-red transition-colors shrink-0" aria-label="Quitar del carrito">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-bib-black/40 rounded-full px-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-bib-white/10 rounded-full text-bib-white transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm text-bib-white w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-bib-white/10 rounded-full text-bib-white transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-bib-red block">
                          ${(item.price * item.quantity).toLocaleString('es-AR')}
                        </span>
                        {item.price_cash > 0 && item.price_cash < item.price && (
                          <span className="text-[10px] text-green-400 block">
                            ${(item.price_cash * item.quantity).toLocaleString('es-AR')} transf.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 sm:p-6 border-t border-bib-white/10 space-y-3 shrink-0">
              <div className="flex justify-between items-center text-base font-medium text-bib-white">
                <span>Subtotal (Tarjeta)</span>
                <span className="text-xl text-bib-red">${total.toLocaleString('es-AR')}</span>
              </div>
              <Link
                to="/cart"
                onClick={closeDrawer}
                className="block w-full text-center bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black font-medium tracking-widest rounded px-6 py-3.5 transition-all duration-300 text-sm uppercase hover:shadow-[0_0_25px_rgba(196,162,120,0.3)]"
              >
                Ver carrito completo
              </Link>
              <button
                onClick={closeDrawer}
                className="block w-full text-center text-bib-gray hover:text-bib-white text-xs uppercase tracking-widest transition-colors py-1"
              >
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}