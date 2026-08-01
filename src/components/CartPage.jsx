import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, Tag, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import FadeIn from './FadeIn';
import SeoHead from './SeoHead';

const API_URL = import.meta.env.VITE_API_URL;
const COUPON_STORAGE_KEY = 'bib_coupon_code';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, discountType, discountValue }
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Si ya había un cupón guardado (de una visita anterior), lo revalidamos contra el total actual
  useEffect(() => {
    const savedCode = localStorage.getItem(COUPON_STORAGE_KEY);
    if (savedCode && total > 0) {
      validarCupon(savedCode, { silencioso: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si cambian las cantidades del carrito, revalidamos el descuento (puede cambiar si es %, o dejar de cumplir el mínimo)
  useEffect(() => {
    if (appliedCoupon && total > 0) {
      validarCupon(appliedCoupon.code, { silencioso: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  async function validarCupon(code, { silencioso = false } = {}) {
    if (!code || !code.trim()) return;
    setCheckingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: total }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setAppliedCoupon(null);
        localStorage.removeItem(COUPON_STORAGE_KEY);
        if (!silencioso) setCouponError(data.message || 'Cupón inválido');
        return;
      }

      setAppliedCoupon({
        code: code.trim().toUpperCase(),
        discount: data.discount,
        discountType: data.discountType,
        discountValue: data.discountValue,
      });
      localStorage.setItem(COUPON_STORAGE_KEY, code.trim().toUpperCase());
      setCouponInput('');
    } catch (err) {
      console.error('Error validando cupón:', err);
      if (!silencioso) setCouponError('No se pudo validar el cupón. Probá de nuevo.');
    } finally {
      setCheckingCoupon(false);
    }
  }

  function handleQuitarCupon() {
    setAppliedCoupon(null);
    setCouponError('');
    localStorage.removeItem(COUPON_STORAGE_KEY);
  }

  const totalConDescuento = total - (appliedCoupon?.discount || 0);

  if (cart.length === 0) {
    return (
      <FadeIn>
        <SeoHead title="Carrito" path="/cart" noindex />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-bib-white px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4 lowercase">Tu carrito está vacío</h2>
          <Link to="/" className="text-bib-gray hover:text-bib-red underline uppercase text-sm tracking-widest transition-colors">Volver a la tienda</Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      <SeoHead title="Carrito" path="/cart" noindex />
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-bib-white mb-10 sm:mb-16 text-center tracking-tight lowercase">tu pedido</h1>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

        <div className="lg:col-span-7 space-y-4 sm:space-y-6 md:space-y-8">
          {cart.map((item, i) => (
            <FadeIn key={item.id} delay={i * 60}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 sm:p-6 md:p-8 bg-bib-dark rounded border border-bib-white/10 transition-all duration-300 hover:border-bib-white/20">
                <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                  <img src={item.image_url} alt={item.name} loading="lazy" decoding="async" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded shrink-0" />
                  <h3 className="font-medium text-base sm:text-lg md:text-xl text-bib-white min-w-0 truncate">{item.name}</h3>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 md:gap-6 shrink-0">
                  <div className="flex items-center gap-2 sm:gap-4 bg-bib-black/40 rounded-full px-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-bib-white/10 rounded-full shrink-0 text-bib-white transition-colors"><Minus size={18} /></button>
                    <span className="font-medium text-base sm:text-lg w-8 sm:w-10 text-center text-bib-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-bib-white/10 rounded-full shrink-0 text-bib-white transition-colors"><Plus size={18} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-bib-red hover:text-bib-white shrink-0 transition-colors hover:scale-110 duration-200"><Trash2 size={20} /></button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={100} className="lg:col-span-5">
          <div className="bg-bib-dark p-6 sm:p-8 md:p-10 rounded border border-bib-white/10 lg:sticky lg:top-28">
            <h2 className="text-sm font-medium text-bib-white mb-6 sm:mb-8 uppercase tracking-widest">Sumario de compra</h2>

            {/* Cupón de descuento */}
            <div className="mb-6 sm:mb-8">
              {appliedCoupon ? (
                <div className="flex items-center justify-between gap-2 bg-bib-red/10 border border-bib-red/30 rounded px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Tag size={16} className="text-bib-red shrink-0" />
                    <span className="text-sm text-bib-white truncate">
                      <span className="font-medium">{appliedCoupon.code}</span> aplicado
                    </span>
                  </div>
                  <button onClick={handleQuitarCupon} className="text-bib-gray hover:text-bib-white shrink-0 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código de descuento"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && validarCupon(couponInput)}
                      className="flex-1 min-w-0 bg-bib-black border border-bib-white/20 rounded px-4 py-2.5 text-sm text-bib-white placeholder:text-bib-white/40 focus:outline-none focus:border-bib-red transition-colors uppercase"
                    />
                    <button
                      onClick={() => validarCupon(couponInput)}
                      disabled={checkingCoupon || !couponInput.trim()}
                      className="shrink-0 bg-bib-white/10 hover:bg-bib-red disabled:opacity-40 text-bib-white px-4 py-2.5 rounded text-xs uppercase tracking-wide transition-colors"
                    >
                      {checkingCoupon ? '...' : 'Aplicar'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-bib-red">{couponError}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2 border-b border-bib-white/10 pb-6 sm:pb-8 mb-6 sm:mb-8">
              <div className="flex justify-between items-center text-sm text-bib-gray">
                <span>Subtotal</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm text-green-400">
                  <span>Descuento</span>
                  <span>-${appliedCoupon.discount.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg sm:text-xl md:text-2xl font-medium text-bib-white pt-2">
                <span>Total</span>
                <span className="text-2xl sm:text-3xl md:text-4xl text-bib-red tracking-tight">${totalConDescuento.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout/entrega')}
              className="w-full bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black font-medium tracking-widest rounded px-6 py-3.5 sm:py-4 transition-all duration-300 text-sm sm:text-base uppercase hover:shadow-[0_0_25px_rgba(196,162,120,0.3)]"
            >
              Continuar
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}