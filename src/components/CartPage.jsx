import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-bib-white px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4 lowercase">Tu carrito está vacío</h2>
        <Link to="/" className="text-bib-gray hover:text-bib-red underline uppercase text-sm tracking-widest">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-bib-white mb-10 sm:mb-16 text-center tracking-tight lowercase">tu pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

        <div className="lg:col-span-7 space-y-4 sm:space-y-6 md:space-y-8">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 sm:p-6 md:p-8 bg-bib-dark rounded border border-bib-white/10">
              <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                <img src={item.image_url} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded shrink-0" />
                <h3 className="font-medium text-base sm:text-lg md:text-xl text-bib-white min-w-0 truncate">{item.name}</h3>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 md:gap-6 shrink-0">
                <div className="flex items-center gap-2 sm:gap-4">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-bib-white/10 rounded shrink-0 text-bib-white"><Minus size={18} /></button>
                  <span className="font-medium text-base sm:text-lg w-8 sm:w-10 text-center text-bib-white">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-bib-white/10 rounded shrink-0 text-bib-white"><Plus size={18} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-bib-red hover:text-bib-white shrink-0"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5 bg-bib-dark p-6 sm:p-8 md:p-10 rounded border border-bib-white/10 lg:sticky lg:top-28">
          <h2 className="text-sm font-medium text-bib-white mb-6 sm:mb-8 uppercase tracking-widest">Sumario de compra</h2>

          <div className="flex justify-between items-center text-lg sm:text-xl md:text-2xl font-medium text-bib-white border-b border-bib-white/10 pb-6 sm:pb-8 mb-6 sm:mb-8">
            <span>Total</span>
            <span className="text-2xl sm:text-3xl md:text-4xl text-bib-red tracking-tight">${total.toLocaleString('es-AR')}</span>
          </div>

          <button
            onClick={() => navigate('/checkout/entrega')}
            className="w-full bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black font-medium tracking-widest rounded px-6 py-3.5 sm:py-4 transition-colors text-sm sm:text-base uppercase"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}