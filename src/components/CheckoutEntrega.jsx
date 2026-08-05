import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { siteConfig } from "../config/site";
import { Tag, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const PESO_ESTIMADO_POR_UNIDAD = 0.5;
const ENVIO_GRATIS_DESDE = 120000;
const COUPON_STORAGE_KEY = 'bib_coupon_code';

const PROVINCIAS = [
  { code: "BA", name: "Buenos Aires" }, { code: "CT", name: "Catamarca" },
  { code: "CH", name: "Chaco" }, { code: "CU", name: "Chubut" },
  { code: "DF", name: "CABA" }, { code: "CB", name: "Córdoba" },
  { code: "CN", name: "Corrientes" }, { code: "ER", name: "Entre Ríos" },
  { code: "FO", name: "Formosa" }, { code: "JY", name: "Jujuy" },
  { code: "LP", name: "La Pampa" }, { code: "LR", name: "La Rioja" },
  { code: "MZ", name: "Mendoza" }, { code: "MN", name: "Misiones" },
  { code: "NQ", name: "Neuquén" }, { code: "RN", name: "Río Negro" },
  { code: "SA", name: "Salta" }, { code: "SJ", name: "San Juan" },
  { code: "SL", name: "San Luis" }, { code: "SC", name: "Santa Cruz" },
  { code: "SF", name: "Santa Fe" }, { code: "SE", name: "Santiago del Estero" },
  { code: "TF", name: "Tierra del Fuego" }, { code: "TU", name: "Tucumán" },
];

const PICKUP_OPTIONS = [
  {
    id: "pickup-merlo",
    pickup: true,
    carrierDescription: "Retiro en Merlo",
    serviceDescription: "Buenos Aires — coordinás día y horario por WhatsApp",
    totalPrice: 0,
    deliveryEstimate: "A coordinar",
  },
  {
    id: "pickup-flores",
    pickup: true,
    carrierDescription: "Retiro en Flores",
    serviceDescription: "CABA — coordinás día y horario por WhatsApp",
    totalPrice: 0,
    deliveryEstimate: "A coordinar",
  },
];

export default function CheckoutEntrega() {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [shippingData, setShippingData] = useState({
    name: "", dni: "", phone: "", email: "", street: "", floor: "", city: "", state: "", postalCode: "",
  });

  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("mercadopago"); // "mercadopago" | "transferencia"

  // Devuelve el precio exacto del ítem según el método de pago elegido
  const getItemPrice = (item, method) => {
    if (method === "transferencia" && item.price_cash && item.price_cash > 0) {
      return item.price_cash;
    }
    return item.price;
  };

  const totalProductos = cart.reduce((sum, item) => sum + (getItemPrice(item, paymentMethod) * item.quantity), 0);
  const subtotalLista = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const ahorroTransferencia = paymentMethod === "transferencia" ? (subtotalLista - totalProductos) : 0;

  const envioGratis = totalProductos >= ENVIO_GRATIS_DESDE;
  const costoEnvio = envioGratis ? 0 : (selectedRate?.totalPrice ?? 0);
  const totalConEnvio = totalProductos - (appliedCoupon?.discount || 0) + costoEnvio;

  useEffect(() => {
    const savedCode = localStorage.getItem(COUPON_STORAGE_KEY);
    if (savedCode && totalProductos > 0) {
      revalidarCupon(savedCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function revalidarCupon(code) {
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: totalProductos }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({ code: code.trim().toUpperCase(), discount: data.discount });
      } else {
        setAppliedCoupon(null);
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (err) {
      console.error("Error revalidando cupón:", err);
    }
  }

  function handleQuitarCupon() {
    setAppliedCoupon(null);
    localStorage.removeItem(COUPON_STORAGE_KEY);
  }

  async function buscarPorCP(cp) {
    if (cp.length !== 4) return;
    try {
      const res = await fetch(`${API_URL}/api/shipping/geocode/${cp}`);
      if (!res.ok) return;
      const data = await res.json();
      const result = Array.isArray(data) ? data[0] : data;
      if (result) {
        setShippingData((prev) => ({
          ...prev,
          state: result.state?.code?.["2digit"] || prev.state,
        }));
      }
    } catch (err) {
      console.error("Error buscando CP:", err);
    }
  }

  async function cotizarEnvio() {
    setLoadingQuote(true);
    setQuoteError(null);
    setSelectedRate(null);

    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedWeight = totalQuantity * PESO_ESTIMADO_POR_UNIDAD;

    const packages = [{
      type: "box",
      content: `Productos ${siteConfig.businessName}`,
      amount: 1,
      declaredValue: totalProductos,
      lengthUnit: "CM",
      weightUnit: "KG",
      weight: estimatedWeight,
      dimensions: { length: 20, width: 20, height: 20 },
    }];

    try {
      const res = await fetch(`${API_URL}/api/shipping/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: {
            name: shippingData.name,
            phone: shippingData.phone,
            street: shippingData.street,
            city: shippingData.city,
            state: shippingData.state,
            postalCode: shippingData.postalCode,
            country: "AR",
          },
          packages,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.rates || data.rates.length === 0) {
        setQuoteError("No se encontraron opciones de envío para esa dirección.");
        setRates([]);
        return;
      }
      setRates(data.rates);
    } catch (err) {
      console.error("Error cotizando envío:", err);
      setQuoteError("Error al conectar con el servidor de envíos.");
    } finally {
      setLoadingQuote(false);
    }
  }

  async function irAPagar() {
    if (!shippingData.name || !shippingData.dni || !shippingData.phone || !shippingData.email || !shippingData.street) {
      alert("Completá nombre, DNI, teléfono, correo y dirección antes de continuar.");
      return;
    }

    setLoadingPayment(true);
    try {
      const direccionCompleta = shippingData.floor
        ? `${shippingData.street}, ${shippingData.floor}`
        : shippingData.street;

      const endpoint = paymentMethod === "transferencia"
        ? "/api/payment/create-transfer-order"
        : "/api/payment/create-preference";

      const itemsConPrecioAjustado = cart.map((item) => ({
        ...item,
        price: getItemPrice(item, paymentMethod)
      }));

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsConPrecioAjustado,
          shippingCost: costoEnvio,
          shippingDescription: selectedRate.customLabel || `${selectedRate.carrierDescription} - ${selectedRate.serviceDescription}`,
          couponCode: appliedCoupon?.code || null,
          customer: {
            name: shippingData.name,
            dni: shippingData.dni,
            phone: shippingData.phone,
            email: shippingData.email,
            address: direccionCompleta,
            city: shippingData.city,
            state: shippingData.state,
            postalCode: shippingData.postalCode,
          },
        }),
      });

      const data = await res.json();

      if (paymentMethod === "transferencia") {
        if (!res.ok) {
          alert("No se pudo registrar el pedido. Probá de nuevo.");
          setLoadingPayment(false);
          return;
        }
        localStorage.removeItem(COUPON_STORAGE_KEY);
        navigate("/checkout/transferencia", {
          state: {
            orderId: data.orderId,
            total: data.total,
            datosTransferencia: data.datosTransferencia,
          },
        });
        return;
      }

      if (!res.ok || !data.init_point) {
        alert("No se pudo iniciar el pago. Probá de nuevo.");
        setLoadingPayment(false);
        return;
      }

      localStorage.removeItem(COUPON_STORAGE_KEY);
      window.location.href = data.init_point;
    } catch (err) {
      console.error("Error iniciando pago:", err);
      alert("Error al conectar con el servidor.");
      setLoadingPayment(false);
    }
  }

  function handleRateChange(value) {
    if (value.startsWith("pickup-")) {
      setSelectedRate(PICKUP_OPTIONS.find((p) => p.id === value));
    } else if (value === "") {
      setSelectedRate(null);
    } else {
      setSelectedRate(rates[value]);
    }
  }

  const selectValue = selectedRate?.pickup ? selectedRate.id : (selectedRate ? rates.indexOf(selectedRate) : "");

  const inputClass =
    "w-full bg-bib-black border border-bib-white/20 rounded px-4 py-3 text-bib-white placeholder:text-bib-white/40 focus:outline-none focus:border-bib-red transition-colors text-sm sm:text-base";

  return (
    <div className="w-full max-w-6xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 sm:mb-16 text-xs sm:text-sm text-bib-gray uppercase tracking-widest">
        <span className="text-bib-white">Carrito</span>
        <div className="h-px w-8 sm:w-12 bg-bib-white/20" />
        <span className="text-bib-red font-medium">Entrega</span>
        <div className="h-px w-8 sm:w-12 bg-bib-white/20" />
        <span>Pago</span>
      </div>

      {!envioGratis && (
        <p className="text-center text-xs sm:text-sm text-bib-red uppercase tracking-widest mb-8 sm:mb-12">
          Envío gratis a partir de ${ENVIO_GRATIS_DESDE.toLocaleString("es-AR")}
        </p>
      )}
      {envioGratis && (
        <p className="text-center text-xs sm:text-sm text-bib-red uppercase tracking-widest mb-8 sm:mb-12">
          ¡Tu compra tiene envío gratis!
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          <div className="bg-bib-dark rounded border border-bib-white/10 p-5 sm:p-8">
            <h2 className="text-sm font-medium text-bib-white mb-4 sm:mb-6 uppercase tracking-widest">Datos de contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input className={inputClass} placeholder="Nombre y apellido" value={shippingData.name} onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })} />
              <input className={inputClass} placeholder="DNI" value={shippingData.dni} onChange={(e) => setShippingData({ ...shippingData, dni: e.target.value })} />
              <input className={inputClass} placeholder="Teléfono de contacto" value={shippingData.phone} onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })} />
              <input className={inputClass} type="email" placeholder="Correo electrónico" value={shippingData.email} onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })} />
            </div>
          </div>

          <div className="bg-bib-dark rounded border border-bib-white/10 p-5 sm:p-8 space-y-3 sm:space-y-4">
            <h2 className="text-sm font-medium text-bib-white mb-1 sm:mb-2 uppercase tracking-widest">Entrega</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <input className={inputClass} placeholder="Código Postal" value={shippingData.postalCode} onChange={(e) => { const cp = e.target.value; setShippingData({ ...shippingData, postalCode: cp }); buscarPorCP(cp); }} />
              <input className={inputClass} placeholder="Localidad" value={shippingData.city} onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })} />
              <select className={inputClass} value={shippingData.state} onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}>
                <option value="" className="bg-bib-black text-bib-red">Provincia</option>
                {PROVINCIAS.map((p) => (<option key={p.code} value={p.code} className="bg-bib-black text-bib-red">{p.name}</option>))}
              </select>
            </div>
            <input className={inputClass} placeholder="Calle y número" value={shippingData.street} onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })} />
            <input className={inputClass} placeholder="Piso / Departamento (opcional)" value={shippingData.floor} onChange={(e) => setShippingData({ ...shippingData, floor: e.target.value })} />

            <button onClick={cotizarEnvio} disabled={loadingQuote} className="w-full sm:w-auto bg-bib-red hover:bg-bib-white disabled:opacity-50 text-bib-white hover:text-bib-black font-medium rounded px-6 py-3 uppercase tracking-widest text-xs transition-colors">
              {loadingQuote ? "Cotizando..." : "Calcular envío"}
            </button>

            {(rates.length > 0 || !quoteError) && (
              <div className="pt-2">
                <label className="block text-xs sm:text-sm text-bib-gray mb-2">Elegí una opción de envío</label>
                <select className={inputClass} value={selectValue} onChange={(e) => handleRateChange(e.target.value)}>
                  <option value="" className="bg-bib-black text-bib-red">Seleccioná una opción</option>
                  {PICKUP_OPTIONS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-bib-black text-bib-red">
                      {p.carrierDescription} — {p.serviceDescription} (sin costo)
                    </option>
                  ))}
                  {rates.map((rate, i) => (
                    <option key={i} value={i} className="bg-bib-black text-bib-red">
                      {rate.carrierDescription} - {rate.serviceDescription} - {rate.customLabel ? rate.customLabel : `$${rate.totalPrice.toLocaleString("es-AR")}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-bib-dark p-6 sm:p-10 rounded border border-bib-white/10 lg:sticky lg:top-28 space-y-3 sm:space-y-4">
          <h2 className="text-sm font-medium text-bib-white mb-4 sm:mb-6 uppercase tracking-widest">Sumario de compra</h2>

          {appliedCoupon && (
            <div className="flex items-center justify-between gap-2 bg-bib-red/10 border border-bib-red/30 rounded px-4 py-2.5 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Tag size={14} className="text-bib-red shrink-0" />
                <span className="text-xs sm:text-sm text-bib-white truncate">
                  <span className="font-medium">{appliedCoupon.code}</span> aplicado
                </span>
              </div>
              <button onClick={handleQuitarCupon} className="text-bib-gray hover:text-bib-white shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex justify-between text-xs sm:text-sm text-bib-gray">
            <span>Subtotal productos</span>
            <span>${totalProductos.toLocaleString("es-AR")}</span>
          </div>

          {ahorroTransferencia > 0 && (
            <div className="flex justify-between text-xs sm:text-sm text-green-400">
              <span>Ahorro por contado / transferencia</span>
              <span>-${ahorroTransferencia.toLocaleString("es-AR")}</span>
            </div>
          )}

          {appliedCoupon && (
            <div className="flex justify-between text-xs sm:text-sm text-green-400">
              <span>Descuento cupón</span>
              <span>-${appliedCoupon.discount.toLocaleString("es-AR")}</span>
            </div>
          )}

          <div className="flex justify-between text-xs sm:text-sm text-bib-gray">
            <span>Envío</span>
            <span>
              {envioGratis
                ? "Gratis"
                : selectedRate
                ? (selectedRate.customLabel ? selectedRate.customLabel : `$${selectedRate.totalPrice.toLocaleString("es-AR")}`)
                : "A calcular"}
            </span>
          </div>

          <div className="pt-2">
            <label className="block text-xs sm:text-sm text-bib-gray mb-2">Método de pago</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("mercadopago")}
                className={`rounded border px-4 py-3 text-xs sm:text-sm text-left transition-colors ${
                  paymentMethod === "mercadopago" ? "border-bib-red bg-bib-red/10 text-bib-white" : "border-bib-white/20 text-bib-gray"
                }`}
              >
                Mercado Pago / Tarjeta
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("transferencia")}
                className={`rounded border px-4 py-3 text-xs sm:text-sm text-left transition-colors ${
                  paymentMethod === "transferencia" ? "border-bib-red bg-bib-red/10 text-bib-white" : "border-bib-white/20 text-bib-gray"
                }`}
              >
                Transferencia bancaria <span className="text-green-400">(Precio Especial)</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-lg sm:text-2xl font-medium text-bib-white border-t border-bib-white/10 pt-4 sm:pt-6">
            <span>Total</span>
            <span className="text-2xl sm:text-4xl text-bib-red tracking-tight">${totalConEnvio.toLocaleString("es-AR")}</span>
          </div>
          <button onClick={irAPagar} disabled={!selectedRate || loadingPayment} className="w-full bg-bib-red hover:bg-bib-white disabled:opacity-40 text-bib-white hover:text-bib-black font-medium rounded px-6 py-3.5 sm:py-4 transition-colors text-sm sm:text-base uppercase tracking-widest mt-2">
            {loadingPayment ? "Redirigiendo..." : paymentMethod === "transferencia" ? "Confirmar pedido" : "Continuar para el pago"}
          </button>
        </div>
      </div>
    </div>
  );
}