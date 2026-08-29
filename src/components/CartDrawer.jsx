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
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-[60] transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel lateral */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
            Tu carrito {cart.length > 0 && `(${cart.reduce((a, i) => a + i.quantity, 0)})`}
          </h2>
          <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 rounded-xl hover:bg-gray-50" aria-label="Cerrar carrito">
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-1">
              <ShoppingBag size={28} strokeWidth={1.5} />
            </div>
            <p className="text-gray-800 text-sm font-semibold">Tu carrito está vacío</p>
            <p className="text-gray-400 text-xs max-w-[200px]">Descubrí nuestros productos y sumá tus favoritos.</p>
            <button onClick={closeDrawer} className="mt-2 text-xs uppercase tracking-wider bg-gray-900 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#C4A278] hover:text-gray-900 transition-all shadow-xs">
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              {cart.map((item) => {
                const itemCash = item.price_cash ? item.price_cash : Math.round(item.price * 0.80);
                return (
                  <div key={item.id} className="flex gap-3.5 pb-4 border-b border-gray-100 last:border-0 items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-[9px]">Sin foto</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1" aria-label="Quitar del carrito">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-200 rounded-md text-gray-700 transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-gray-900 w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-200 rounded-md text-gray-700 transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900 block">
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                          </span>
                          {item.price_cash > 0 && item.price_cash < item.price && (
                            <span className="text-[10px] text-emerald-700 font-medium block">
                              ${(itemCash * item.quantity).toLocaleString('es-AR')} transf.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 sm:p-6 border-t border-gray-100 space-y-3 shrink-0 bg-white">
              <div className="flex justify-between items-center text-sm font-semibold text-gray-900">
                <span className="text-xs uppercase tracking-wider text-gray-500">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">${total.toLocaleString('es-AR')}</span>
              </div>
              <Link
                to="/cart"
                onClick={closeDrawer}
                className="block w-full text-center bg-gray-900 hover:bg-[#C4A278] text-white hover:text-gray-900 font-bold tracking-wider rounded-xl px-6 py-3 transition-all duration-200 text-xs uppercase shadow-sm"
              >
                Ver carrito completo
              </Link>
              <button
                onClick={closeDrawer}
                className="block w-full text-center text-gray-500 hover:text-gray-900 text-xs uppercase tracking-wider transition-colors py-1 font-medium"
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