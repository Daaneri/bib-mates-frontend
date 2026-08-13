import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { CreditCard, Banknote, Truck } from "lucide-react";
import { supabase } from "../supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const COUPON_STORAGE_KEY = "applied_coupon_code";

const PUNTOS_RETIRO = [
  { value: "merlo", label: "Merlo", detalle: "Coordinamos el punto exacto por WhatsApp" },
  { value: "caba-flores", label: "CABA - Flores", detalle: "Coordinamos el punto exacto por WhatsApp" },
];

export default function CheckoutEntrega() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("mercadopago");
  const [shippingType, setShippingType] = useState("envio");
  const [pickupLocation, setPickupLocation] = useState("merlo");
  const [shippingCost, setShippingCost] = useState(0);
  const [isShippingCalculated, setIsShippingCalculated] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  // LÓGICA DE PRECIOS:
  // Transferencia = price_cash (si existe y es mayor a 0).
  // Mercado Pago = price (Precio de lista).
  const itemsFormat = cart.map((item) => {
    const basePrice = Number(item.price) || 0;
    const cashPrice = item.price_cash && Number(item.price_cash) > 0 ? Number(item.price_cash) : basePrice;

    const price = paymentMethod === "transferencia" ? cashPrice : basePrice;

    return {
      id: item.id,
      name: item.name || item.nombre,
      quantity: item.quantity || item.cantidad || 1,
      price: price,
      originalPrice: basePrice,
      price_cash: cashPrice,
    };
  });

  const totalProductos = itemsFormat.reduce((sum, i) => sum + i.price * i.quantity, 0);

  useEffect(() => {
    const savedCode = localStorage.getItem(COUPON_STORAGE_KEY);
    if (savedCode) {
      revalidarCupon(savedCode);
    }
  }, []);

  useEffect(() => {
    if (appliedCoupon?.discount_percentage) {
      const nuevoDescuento = Math.round((totalProductos * appliedCoupon.discount_percentage) / 100);
      setAppliedCoupon((prev) => ({ ...prev, discount: nuevoDescuento }));
    }
  }, [paymentMethod, totalProductos]);

  useEffect(() => {
    const guardarCarritoPendiente = async () => {
      const phoneClean = formData.phone.trim();
      if (formData.name.trim() && phoneClean.length >= 8 && itemsFormat.length > 0) {
        try {
          await supabase.from("carritos_abandonados").upsert(
            [
              {
                cliente_nombre: formData.name.trim(),
                cliente_telefono: phoneClean,
                items: itemsFormat,
                monto_total: totalProductos,
                recuperado: false,
                created_at: new Date().toISOString()
              },
            ],
            { onConflict: 'cliente_telefono' }
          );
        } catch (err) {
          console.error("Error registrando carrito pendiente:", err);
        }
      }
    };

    const timeout = setTimeout(guardarCarritoPendiente, 800);
    return () => clearTimeout(timeout);
  }, [formData.phone, formData.name, totalProductos]);

  const handleShippingTypeChange = (type) => {
    setShippingType(type);
    if (type === "retiro") {
      setShippingCost(0);
      setIsShippingCalculated(true);
    } else {
      setShippingCost(0);
      setIsShippingCalculated(false);
    }
  };

  const handleCalculateShipping = () => {
    if (!formData.postalCode.trim()) {
      setErrorMessage("Por favor ingresa un Código Postal para calcular el envío.");
      return;
    }
    setErrorMessage("");
    setIsCalculatingShipping(true);

    setTimeout(() => {
      setShippingCost(8000);
      setIsShippingCalculated(true);
      setIsCalculatingShipping(false);
    }, 200);
  };

  const totalDescuento = appliedCoupon ? appliedCoupon.discount : 0;
  const totalFinal = Math.max(0, totalProductos - totalDescuento + (shippingType === "envio" ? shippingCost : 0));

  async function revalidarCupon(code) {
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.discount_percentage) {
        const montoDescuento = Math.round((totalProductos * data.discount_percentage) / 100);
        setAppliedCoupon({
          code: data.code,
          discount_percentage: data.discount_percentage,
          discount: montoDescuento,
        });
      } else {
        setAppliedCoupon(null);
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (err) {
      console.error("Error revalidando cupón:", err);
    }
  }

  async function handleApplyCoupon(e) {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();

      if (res.ok) {
        const montoDescuento = Math.round((totalProductos * data.discount_percentage) / 100);
        setAppliedCoupon({
          code: data.code,
          discount_percentage: data.discount_percentage,
          discount: montoDescuento,
        });
        localStorage.setItem(COUPON_STORAGE_KEY, data.code);
        setCouponCode("");
      } else {
        setCouponError(data.error || "Cupón no válido");
      }
    } catch (err) {
      setCouponError("Error al conectar con el servidor");
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    localStorage.removeItem(COUPON_STORAGE_KEY);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "postalCode" && shippingType === "envio") {
      setIsShippingCalculated(false);
      setShippingCost(0);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("El carrito está vacío.");
      return;
    }

    if (shippingType === "envio" && !isShippingCalculated) {
      setErrorMessage("Debes calcular el costo de envío antes de continuar.");
      return;
    }

    setIsSubmitting(true);

    const puntoElegido = PUNTOS_RETIRO.find((p) => p.value === pickupLocation);
    const customerData =
      shippingType === "retiro"
        ? {
            ...formData,
            address: `Retiro en punto - ${puntoElegido?.label || pickupLocation}`,
            city: puntoElegido?.label || "",
            state: "",
            postalCode: "",
          }
        : formData;

    const payload = {
      items: itemsFormat,
      total: totalFinal,
      shippingCost: shippingType === "envio" ? shippingCost : 0,
      shippingDescription:
        shippingType === "envio"
          ? "Envío a domicilio"
          : `Retiro en sucursal - ${puntoElegido?.label || pickupLocation}`,
      customer: customerData,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      paymentMethod: paymentMethod,
    };

    try {
      if (paymentMethod === "mercadopago") {
        const res = await fetch(`${API_URL}/api/payment/create-preference`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (res.ok && data.init_point) {
          localStorage.removeItem(COUPON_STORAGE_KEY);
          window.location.href = data.init_point;
        } else {
          setErrorMessage(data.error || "Error al conectar con Mercado Pago.");
          setIsSubmitting(false);
        }
      } else {
        const res = await fetch(`${API_URL}/api/payment/create-transfer-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (res.ok) {
          localStorage.removeItem(COUPON_STORAGE_KEY);
          clearCart();
          navigate("/checkout/transferencia-confirmada", { state: data });
        } else {
          setErrorMessage(data.error || "Error al procesar el pedido.");
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Ocurrió un error inesperado al procesar el pedido.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-bib-white">
      <div>
        <h2 className="text-2xl font-bold mb-4 font-heading tracking-wide">Datos del Cliente y Entrega</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-bib-gray mb-1">Nombre Completo</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-bib-dark border border-bib-white/10 p-2.5 rounded text-bib-white focus:border-bib-red focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-bib-gray mb-1">DNI</label>
              <input
                type="text"
                name="dni"
                required
                value={formData.dni}
                onChange={handleInputChange}
                className="w-full bg-bib-dark border border-bib-white/10 p-2.5 rounded text-bib-white focus:border-bib-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-bib-gray mb-1">Teléfono</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-bib-dark border border-bib-white/10 p-2.5 rounded text-bib-white focus:border-bib-red focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-bib-gray mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-bib-dark border border-bib-white/10 p-2.5 rounded text-bib-white focus:border-bib-red focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <label className="block text-xs uppercase tracking-wider text-bib-gray mb-2">Método de entrega</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="shippingType"
                  value="envio"
                  checked={shippingType === "envio"}
                  onChange={() => handleShippingTypeChange("envio")}
                  className="accent-bib-red"
                />
                Envío a Domicilio
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="shippingType"
                  value="retiro"
                  checked={shippingType === "retiro"}
                  onChange={() => handleShippingTypeChange("retiro")}
                  className="accent-bib-red"
                />
                Retiro Gratis
              </label>
            </div>
          </div>

          {shippingType === "retiro" && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs uppercase tracking-wider text-bib-gray mb-1">
                Elegí el punto de retiro
              </label>
              {PUNTOS_RETIRO.map((punto) => (
                <label
                  key={punto.value}
                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    pickupLocation === punto.value
                      ? "border-bib-red bg-bib-red/10"
                      : "border-bib-white/10 hover:border-bib-white/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="pickupLocation"
                    value={punto.value}
                    checked={pickupLocation === punto.value}
                    onChange={() => setPickupLocation(punto.value)}
                    className="accent-bib-red mt-0.5"
                  />
                  <div>
                    <p className="text-sm text-bib-white font-medium">{punto.label}</p>
                    <p className="text-xs text-bib-gray">{punto.detalle}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {shippingType === "envio" && (
            <div className="space-y-2 pt-2">
              <input
                type="text"
                name="address"
                placeholder="Dirección y Número"
                required={shippingType === "envio"}
                value={formData.address}
                onChange={handleInputChange}
                className="w-full bg-bib-dark border border-bib-white/10 p-2.5 rounded text-bib-white focus:border-bib-red focus:outline-none placeholder-bib-gray/50"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="city"
                  placeholder="Ciudad"
                  required={shippingType === "envio"}
                  value={formData.city}
                  onChange={handleInputChange}
                  className="bg-bib-dark border border-bib-white/10 p-2.5 rounded text-bib-white focus:border-bib-red focus:outline-none placeholder-bib-gray/50"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="Provincia"
                  required={shippingType === "envio"}
                  value={formData.state}
                  onChange={handleInputChange}
                  className="bg-bib-dark border border-bib-white/10 p-2.5 rounded text-bib-white focus:border-bib-red focus:outline-none placeholder-bib-gray/50"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Cód. Postal"
                  required={shippingType === "envio"}
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="bg-bib-dark border border-bib-white/10 p-2.5 rounded text-bib-white focus:border-bib-red focus:outline-none placeholder-bib-gray/50 w-1/2"
                />
                <button
                  type="button"
                  onClick={handleCalculateShipping}
                  disabled={isCalculatingShipping || !formData.postalCode.trim()}
                  className="w-1/2 bg-bib-white/10 hover:bg-bib-white/20 text-bib-white border border-bib-white/20 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Truck size={14} />
                  {isCalculatingShipping ? "Calculando..." : "Calcular Envío"}
                </button>
              </div>
              {isShippingCalculated && (
                <p className="text-xs text-green-400 font-medium pt-1">
                  ✓ Envío cotizado: $8.000 ARS
                </p>
              )}
            </div>
          )}

          <div className="pt-2">
            <label className="block text-xs uppercase tracking-wider text-bib-gray mb-2">Selecciona Medio de Pago</label>
            <div className="space-y-3">
              <label className={`flex flex-col border p-3.5 rounded cursor-pointer transition-all ${paymentMethod === "mercadopago" ? "border-blue-500 bg-blue-500/10" : "border-bib-white/10 bg-bib-dark hover:border-bib-white/20"}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mercadopago"
                    checked={paymentMethod === "mercadopago"}
                    onChange={() => setPaymentMethod("mercadopago")}
                    className="accent-blue-500"
                  />
                  <CreditCard size={18} className="text-blue-400" />
                  <span className="font-medium text-bib-white text-sm">Mercado Pago (Tarjetas hasta 3 cuotas sin interes)</span>
                </div>
              </label>

              <label className={`flex flex-col border p-3.5 rounded cursor-pointer transition-all ${paymentMethod === "transferencia" ? "border-green-500 bg-green-500/10" : "border-bib-white/10 bg-bib-dark hover:border-bib-white/20"}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transferencia"
                    checked={paymentMethod === "transferencia"}
                    onChange={() => setPaymentMethod("transferencia")}
                    className="accent-green-500"
                  />
                  <Banknote size={18} className="text-green-400" />
                  <span className="font-medium text-bib-white text-sm">Transferencia Bancaria</span>
                </div>
                <p className="text-xs text-green-400 ml-6 mt-1">
                  🔥 <strong>Aplica Precio de Contado / Efectivo</strong>
                </p>
              </label>
            </div>
          </div>

          {errorMessage && <p className="text-red-400 text-sm mt-2">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting || (shippingType === "envio" && !isShippingCalculated)}
            className="w-full bg-bib-red text-bib-black font-bold py-3.5 rounded mt-4 uppercase tracking-widest disabled:opacity-50 hover:bg-bib-white transition-all active:scale-[0.98]"
          >
            {isSubmitting
              ? "Cargando..."
              : paymentMethod === "mercadopago"
              ? "Ir a Pagar a Mercado Pago ➔"
              : "Confirmar Pedido por Transferencia"}
          </button>
        </form>
      </div>

      <div className="bg-bib-dark p-6 rounded border border-bib-white/10 h-fit">
        <h3 className="text-xl font-bold mb-4 font-heading tracking-wide border-b border-bib-white/10 pb-3">Resumen del Pedido</h3>
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {itemsFormat.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-bib-white/80">{item.name} x{item.quantity}</span>
              <span className="font-medium text-bib-white">${(item.price * item.quantity).toLocaleString("es-AR")}</span>
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-bib-white/10 pt-4">
          <label className="block text-xs uppercase tracking-wider text-bib-gray mb-1.5">Cupón de Descuento</label>
          {appliedCoupon ? (
            <div className="flex justify-between items-center bg-green-950/40 border border-green-500/30 p-2.5 rounded">
              <div>
                <p className="text-sm font-semibold text-green-400">
                  {appliedCoupon.code} ({appliedCoupon.discount_percentage}% OFF)
                </p>
                <p className="text-xs text-green-300">-${appliedCoupon.discount.toLocaleString("es-AR")}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-red-400 text-xs font-semibold hover:underline"
              >
                Quitar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="CÓDIGO"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="bg-bib-card border border-bib-white/10 p-2 rounded text-sm w-full uppercase text-bib-white focus:border-bib-red focus:outline-none placeholder-bib-gray/50"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !couponCode.trim()}
                className="bg-bib-white/10 text-bib-white px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider disabled:opacity-50 hover:bg-bib-white/20"
              >
                Aplicar
              </button>
            </div>
          )}
          {couponError && <p className="text-red-400 text-xs mt-1">{couponError}</p>}
        </div>

        <div className="space-y-2 text-sm border-t border-bib-white/10 pt-4">
          <div className="flex justify-between text-bib-gray">
            <span>Subtotal ({paymentMethod === "transferencia" ? "Precio Contado" : "Precio Lista"})</span>
            <span className="text-bib-white">${totalProductos.toLocaleString("es-AR")}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-green-400 font-medium">
              <span>Descuento Cupón</span>
              <span>-${totalDescuento.toLocaleString("es-AR")}</span>
            </div>
          )}
          <div className="flex justify-between text-bib-gray">
            <span>Envío</span>
            <span className="text-[#C4A278] font-semibold">
              {shippingType === "envio"
                ? isShippingCalculated
                  ? `$${shippingCost.toLocaleString("es-AR")}`
                  : "Por calcular"
                : "Gratis"}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t border-bib-white/10 text-bib-white">
            <span>Total</span>
            <span className="text-bib-red">${totalFinal.toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}