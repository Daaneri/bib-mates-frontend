import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const COUPON_STORAGE_KEY = "applied_coupon_code";

export default function CheckoutEntrega() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("mercadopago"); // 'mercadopago' | 'transferencia'
  const [shippingType, setShippingType] = useState("envio"); // 'envio' | 'retiro'
  const [shippingCost, setShippingCost] = useState(0);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount_percentage, discount }
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

  // Formatear precios según medio de pago
  const itemsFormat = cart.map((item) => {
    const price = paymentMethod === "transferencia" && item.price_cash 
      ? item.price_cash 
      : item.price;
    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: price,
    };
  });

  const totalProductos = itemsFormat.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Cargar cupón guardado en localStorage al iniciar
  useEffect(() => {
    const savedCode = localStorage.getItem(COUPON_STORAGE_KEY);
    if (savedCode) {
      revalidarCupon(savedCode);
    }
  }, []);

  // Recalcular descuento si cambia el precio o medio de pago
  useEffect(() => {
    if (appliedCoupon?.discount_percentage) {
      const nuevoDescuento = Math.round((totalProductos * appliedCoupon.discount_percentage) / 100);
      setAppliedCoupon((prev) => ({ ...prev, discount: nuevoDescuento }));
    }
  }, [paymentMethod, totalProductos]);

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
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("El carrito está vacío.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      items: itemsFormat,
      shippingCost: shippingType === "envio" ? shippingCost : 0,
      shippingDescription: shippingType === "envio" ? "Envío a domicilio" : "Retiro en sucursal",
      customer: formData,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
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
          setErrorMessage(data.error || "Error al generar el pago con Mercado Pago.");
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
          setErrorMessage(data.error || "Error al procesar el pedido por transferencia.");
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
    <div className="max-w-4xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Datos del Cliente y Entrega</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre Completo</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">DNI</label>
              <input
                type="text"
                name="dni"
                required
                value={formData.dni}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Teléfono</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium mb-1">Método de entrega</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="shippingType"
                  value="envio"
                  checked={shippingType === "envio"}
                  onChange={() => setShippingType("envio")}
                />
                Envío a Domicilio
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="shippingType"
                  value="retiro"
                  checked={shippingType === "retiro"}
                  onChange={() => setShippingType("retiro")}
                />
                Retiro Gratis
              </label>
            </div>
          </div>

          {shippingType === "envio" && (
            <div className="space-y-2 pt-2">
              <input
                type="text"
                name="address"
                placeholder="Dirección y Número"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="city"
                  placeholder="Ciudad"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="Provincia"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="C.P."
                  required
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="border p-2 rounded"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <label className="block text-sm font-medium mb-1">Medio de Pago</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 border p-3 rounded cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mercadopago"
                  checked={paymentMethod === "mercadopago"}
                  onChange={() => setPaymentMethod("mercadopago")}
                />
                <span>Mercado Pago / Tarjetas</span>
              </label>
              <label className="flex items-center gap-2 border p-3 rounded cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transferencia"
                  checked={paymentMethod === "transferencia"}
                  onChange={() => setPaymentMethod("transferencia")}
                />
                <span>Transferencia Bancaria</span>
              </label>
            </div>
          </div>

          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded mt-4 disabled:opacity-50"
          >
            {isSubmitting ? "Procesando..." : paymentMethod === "mercadopago" ? "Pagar con Mercado Pago" : "Confirmar Pedido"}
          </button>
        </form>
      </div>

      <div className="bg-gray-50 p-6 rounded border h-fit">
        <h3 className="text-xl font-bold mb-4">Resumen del Pedido</h3>
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {itemsFormat.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toLocaleString("es-AR")}</span>
            </div>
          ))}
        </div>

        <hr className="my-4" />

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Cupón de Descuento</label>
          {appliedCoupon ? (
            <div className="flex justify-between items-center bg-green-100 border border-green-300 p-2 rounded">
              <div>
                <p className="text-sm font-semibold text-green-800">
                  {appliedCoupon.code} ({appliedCoupon.discount_percentage}% OFF)
                </p>
                <p className="text-xs text-green-700">-${appliedCoupon.discount.toLocaleString("es-AR")}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-red-500 text-xs font-semibold hover:underline"
              >
                Quitar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ingresar código"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="border p-2 rounded text-sm w-full uppercase"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !couponCode.trim()}
                className="bg-gray-800 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                Aplicar
              </button>
            </div>
          )}
          {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
        </div>

        <hr className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${totalProductos.toLocaleString("es-AR")}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Descuento</span>
              <span>-${totalDescuento.toLocaleString("es-AR")}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Envío</span>
            <span>{shippingType === "envio" ? `$${shippingCost.toLocaleString("es-AR")}` : "Gratis"}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t">
            <span>Total</span>
            <span>${totalFinal.toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}