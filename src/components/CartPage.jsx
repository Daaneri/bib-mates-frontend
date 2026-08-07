import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, Tag, X, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import FadeIn from './FadeIn';
import SeoHead from './SeoHead';

const API_URL = import.meta.env.VITE_API_URL;
const COUPON_STORAGE_KEY = 'bib_coupon_code';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  
  // Subtotal base (Precio de lista)
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Subtotal en caso de elegir Transferencia
  const totalTransferencia = cart.reduce((acc, item) => {
    const priceCash = item.price_cash && item.price_cash > 0 ? item.price_cash : item.price;
    return acc + (priceCash * item.quantity);
  }, 0);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    const savedCode = localStorage.getItem(COUPON_STORAGE_KEY);
    if (savedCode && total > 0) {
      validarCupon(savedCode, { silencioso: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        <div className="lg:col-span-7 space-y-4">
          {cart.map((item, i) => {
            const hasCashDiscount = item.price_cash && item.price_cash > 0 && item.price_cash < item.price;
            return (
              <FadeIn key={item.id} delay={i * 60}>
                <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-bib-dark rounded border border-bib-white/10 transition-all duration-300 hover:border-bib-white/20">
                  
                  {/* Foto del producto */}
                  <img src={item.image_url} alt={item.name} loading="lazy" decoding="async" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded shrink-0 border border-bib-white/5" />
                  
                  {/* Información del producto */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-medium text-base sm:text-lg text-bib-white truncate leading-snug">{item.name}</h3>
                    <div className="text-xs space-y-0.5">
                      <p className="text-bib-gray">
                        Lista / MP: <span className="text-bib-white font-medium">${(item.price).toLocaleString('es-AR')}</span>
                      </p>
                      {hasCashDiscount && (
                        <p className="text-green-400">
                          Transferencia: <span className="font-medium">${(item.price_cash).toLocaleString('es-AR')}</span>
                        </p>
                      )}
                    </div>

                    {/* Controles de cantidad en móviles */}
                    <div className="flex items-center gap-2 pt-2 sm:hidden">
                      <div className="flex items-center border border-bib-white/10 bg-bib-black/40 rounded px-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-bib-white hover:text-bib-red"><Minus size={14} /></button>
                        <span className="font-medium text-xs w-6 text-center text-bib-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-bib-white hover:text-bib-red"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-bib-red p-1 hover:text-bib-white transition-colors ml-auto"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  {/* Controles de cantidad y eliminar en pantallas normales */}
                  <div className="hidden sm:flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2 border border-bib-white/10 bg-bib-black/40 rounded-full px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-full text-bib-white hover:bg-bib-white/10 transition-colors"><Minus size={14} /></button>
                      <span className="font-medium text-sm w-6 text-center text-bib-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-full text-bib-white hover:bg-bib-white/10 transition-colors"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-bib-red hover:text-bib-white p-1 transition-colors hover:scale-110 duration-200"><Trash2 size={18} /></button>
                  </div>

                </div>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn delay={100} className="lg:col-span-5">
          <div className="bg-bib-dark p-6 sm:p-8 rounded border border-bib-white/10 lg:sticky lg:top-28">
            <h2 className="text-xs font-bold text-bib-white mb-6 uppercase tracking-widest">Sumario de compra</h2>

            {/* Cupón de descuento */}
            <div className="mb-6">
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

            <div className="space-y-2 border-b border-bib-white/10 pb-6 mb-6">
              <div className="flex justify-between items-center text-xs text-bib-gray">
                <span>Subtotal (Tarjeta / MP)</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-green-400">
                <span>Subtotal (Transferencia)</span>
                <span>${totalTransferencia.toLocaleString('es-AR')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-xs text-green-400 pt-2">
                  <span>Descuento Cupón</span>
                  <span>-${appliedCoupon.discount.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-base sm:text-lg font-bold text-bib-white pt-2">
                <span>Total estimado</span>
                <span className="text-xl sm:text-2xl text-bib-white tracking-tight">${totalConDescuento.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout/entrega')}
              className="w-full bg-[#C4A278] hover:bg-bib-white text-bib-black font-bold tracking-widest rounded px-6 py-3.5 transition-all duration-300 text-xs uppercase hover:shadow-[0_0_25px_rgba(196,162,120,0.3)]"
            >
              Continuar
            </button>

            {/* BADGE DE COMPRA SEGURA */}
            <div className="pt-4 flex items-center justify-center gap-2 text-bib-gray text-xs border-t border-bib-white/5 mt-4">
              <ShieldCheck size={16} className="text-[#C4A278] shrink-0" />
              <span className="tracking-wide">Compra 100% Segura y Protegida</span>
            </div>

          </div>
        </FadeIn>
      </div>
    </div>
  );
}