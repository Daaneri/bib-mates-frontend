import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { siteConfig } from '../config/site';

export default function PagoTransferencia() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total, datosTransferencia } = location.state || {};
  const [copiado, setCopiado] = useState('');

  // Si alguien entra directo a esta URL sin haber pasado por el checkout, lo mandamos de vuelta
  if (!orderId || !datosTransferencia) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 sm:py-24 px-4 sm:px-6 text-center">
        <p className="text-bib-gray mb-6">No encontramos los datos de este pedido.</p>
        <Link to="/" className="text-bib-red hover:text-bib-white uppercase tracking-widest text-sm">
          Volver al inicio
        </Link>
      </div>
    );
  }

  async function copiar(texto, campo) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(campo);
      setTimeout(() => setCopiado(''), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }

  const filaDato = (label, valor, campo) => (
    <div className="flex items-center justify-between gap-3 bg-bib-black border border-bib-white/10 rounded px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] text-bib-gray uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm sm:text-base text-bib-white break-all">{valor}</p>
      </div>
      <button
        onClick={() => copiar(valor, campo)}
        className="shrink-0 text-bib-gray hover:text-bib-red transition-colors p-2"
        title={`Copiar ${label.toLowerCase()}`}
      >
        {copiado === campo ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 sm:mb-16 text-xs sm:text-sm text-bib-gray uppercase tracking-widest">
        <span>Carrito</span>
        <div className="h-px w-8 sm:w-12 bg-bib-white/20" />
        <span>Entrega</span>
        <div className="h-px w-8 sm:w-12 bg-bib-white/20" />
        <span className="text-bib-red font-medium">Pago</span>
      </div>

      <div className="bg-bib-dark rounded border border-bib-white/10 p-6 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-lg sm:text-xl text-bib-white uppercase tracking-widest font-medium">
            ¡Pedido registrado!
          </h1>
          <p className="text-sm text-bib-gray">
            Pedido <span className="text-bib-white">#{orderId}</span> — transferí el total para confirmarlo
          </p>
        </div>

        <div className="text-center py-4 border-y border-bib-white/10">
          <p className="text-xs text-bib-gray uppercase tracking-widest mb-1">Total a transferir</p>
          <p className="text-3xl sm:text-4xl text-bib-red font-medium tracking-tight">
            ${Number(total).toLocaleString('es-AR')}
          </p>
        </div>

        <div className="space-y-3">
          {filaDato('CVU', datosTransferencia.cvu, 'cvu')}
          {filaDato('Alias', datosTransferencia.alias, 'alias')}
          {filaDato('Titular', datosTransferencia.titular, 'titular')}
        </div>

        <div className="bg-bib-black border border-bib-white/10 rounded p-4 space-y-2">
          <p className="text-xs sm:text-sm text-bib-gray leading-relaxed">
            Una vez hecha la transferencia, mandanos el comprobante por WhatsApp o respondiendo el correo de confirmación que te enviamos a tu casilla. Así validamos el pago y preparamos tu pedido.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black font-medium rounded px-6 py-3.5 transition-colors text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>
      </div>
    </div>
  );
}