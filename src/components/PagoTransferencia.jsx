import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Copy, ArrowLeft, MessageCircle, Building2, CreditCard, User, AlertCircle } from "lucide-react";
import { siteConfig } from "../config/site";

export default function PagoTransferencia() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;

  const [copiedField, setCopiedField] = useState("");

  // Si no vienen datos de orden por recarga de página o acceso directo
  if (!orderData) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-bib-dark border border-bib-white/10 rounded-xl text-center text-bib-white shadow-2xl">
        <AlertCircle size={48} className="text-bib-red mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No se encontraron datos del pedido</h2>
        <p className="text-sm text-bib-gray mb-6">
          Es posible que hayas recargado la página o ingresado directamente a esta ruta.
        </p>
        <Link
          to="/"
          className="inline-block bg-bib-red text-bib-black font-bold px-6 py-3 rounded-lg uppercase tracking-wider text-xs hover:bg-bib-white transition-all"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const { orderId, total, datosTransferencia } = orderData;

  // Sanitizar número de WhatsApp
  const cleanWhatsappNumber = siteConfig?.whatsapp
    ? String(siteConfig.whatsapp).replace(/[^0-9]/g, "")
    : "";

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2500);
  };

  // Mensaje prediseñado para WhatsApp con el número de orden
  const mensajeWhatsapp = encodeURIComponent(
    `¡Hola! Realicé el pago por transferencia de la Orden #${orderId}. Adjunto mi comprobante de pago.`
  );

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 md:p-8 bg-bib-dark border border-bib-white/10 rounded-xl text-bib-white shadow-2xl">
      {/* Encabezado */}
      <div className="text-center pb-6 border-b border-bib-white/10">
        <CheckCircle2 size={60} className="text-green-400 mx-auto mb-3" />
        <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-wide">
          ¡Pedido Registrado!
        </h1>
        <p className="text-sm text-bib-gray mt-2">
          Número de Orden: <strong className="text-bib-white font-mono text-base">#{orderId}</strong>
        </p>
      </div>

      {/* Cartel con Monto Final (Con Descuento Aplicado) */}
      <div className="my-6 bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-center">
        <p className="text-xs uppercase tracking-wider text-green-400 mb-1 font-semibold">
          Monto Total a Transferir (20% OFF Aplicado)
        </p>
        <p className="text-3xl md:text-4xl font-extrabold text-green-400 font-mono">
          ${Number(total || 0).toLocaleString("es-AR")} ARS
        </p>
      </div>

      {/* Datos Bancarios */}
      <div className="space-y-4 my-6">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-bib-gray border-b border-bib-white/10 pb-2">
          Datos de la Cuenta Bancaria
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* CBU / CVU */}
          <div className="bg-bib-card p-3.5 rounded-lg border border-bib-white/5 flex justify-between items-center">
            <div>
              <p className="text-xs text-bib-gray flex items-center gap-1.5 mb-1">
                <CreditCard size={14} /> CBU / CVU
              </p>
              <p className="font-mono text-sm font-semibold tracking-wide">
                {datosTransferencia?.cbu || siteConfig?.bankDetails?.cbu || "Consultar por WP"}
              </p>
            </div>
            {(datosTransferencia?.cbu || siteConfig?.bankDetails?.cbu) && (
              <button
                onClick={() =>
                  copyToClipboard(datosTransferencia?.cbu || siteConfig?.bankDetails?.cbu, "CBU")
                }
                className="p-2 text-bib-gray hover:text-bib-white hover:bg-bib-white/10 rounded transition-all"
                title="Copiar CBU"
              >
                <Copy size={16} />
              </button>
            )}
          </div>

          {/* ALIAS */}
          <div className="bg-bib-card p-3.5 rounded-lg border border-bib-white/5 flex justify-between items-center">
            <div>
              <p className="text-xs text-bib-gray flex items-center gap-1.5 mb-1">
                <Building2 size={14} /> Alias
              </p>
              <p className="font-mono text-sm font-semibold tracking-wide">
                {datosTransferencia?.alias || siteConfig?.bankDetails?.alias || "Consultar por WP"}
              </p>
            </div>
            {(datosTransferencia?.alias || siteConfig?.bankDetails?.alias) && (
              <button
                onClick={() =>
                  copyToClipboard(datosTransferencia?.alias || siteConfig?.bankDetails?.alias, "Alias")
                }
                className="p-2 text-bib-gray hover:text-bib-white hover:bg-bib-white/10 rounded transition-all"
                title="Copiar Alias"
              >
                <Copy size={16} />
              </button>
            )}
          </div>

          {/* Titular */}
          <div className="bg-bib-card p-3.5 rounded-lg border border-bib-white/5">
            <p className="text-xs text-bib-gray flex items-center gap-1.5 mb-1">
              <User size={14} /> Titular
            </p>
            <p className="text-sm font-semibold">
              {datosTransferencia?.titular || siteConfig?.bankDetails?.titular || "Bib Mates"}
            </p>
          </div>

          {/* Banco */}
          <div className="bg-bib-card p-3.5 rounded-lg border border-bib-white/5">
            <p className="text-xs text-bib-gray flex items-center gap-1.5 mb-1">
              <Building2 size={14} /> Banco / Entidad
            </p>
            <p className="text-sm font-semibold">
              {datosTransferencia?.banco || siteConfig?.bankDetails?.banco || "Mercado Pago / Banco"}
            </p>
          </div>
        </div>

        {/* Notificación de copiado */}
        {copiedField && (
          <p className="text-xs text-green-400 text-center font-medium animate-pulse">
            ¡{copiedField} copiado al portapapeles!
          </p>
        )}
      </div>

      {/* Pasos a seguir */}
      <div className="bg-bib-white/5 p-4 rounded-lg text-xs text-bib-gray space-y-2 border border-bib-white/10 my-6">
        <p className="font-semibold text-bib-white uppercase tracking-wider mb-1">
          Instrucciones para completar tu compra:
        </p>
        <p>1. Realizá la transferencia por el monto exacto de <strong>${Number(total || 0).toLocaleString("es-AR")}</strong>.</p>
        <p>2. Enviá el comprobante de pago haciendo clic en el botón de abajo o por WhatsApp.</p>
        <p>3. Indicá el número de orden (<strong>#{orderId}</strong>) en tu mensaje.</p>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        {cleanWhatsappNumber && (
          <a
            href={`https://wa.me/${cleanWhatsappNumber}?text=${mensajeWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <MessageCircle size={18} />
            Enviar Comprobante por WhatsApp
          </a>
        )}

        <button
          onClick={() => navigate("/")}
          className="flex-1 bg-bib-white/10 hover:bg-bib-white/20 text-bib-white font-bold py-3.5 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-bib-white/20"
        >
          <ArrowLeft size={16} />
          Volver a la Tienda
        </button>
      </div>
    </div>
  );
}