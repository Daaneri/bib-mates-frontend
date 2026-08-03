import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { XCircle, MessageCircle } from 'lucide-react';
import { siteConfig } from '../config/site';
import FadeIn from './FadeIn';

export default function PagoError() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <FadeIn>
        <div className="max-w-md w-full text-center bg-bib-dark border border-bib-white/10 rounded p-8 sm:p-12">
          <XCircle size={52} className="text-bib-red mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-bib-white mb-3 lowercase">
            no pudimos procesar el pago
          </h1>
          <p className="text-bib-gray text-sm sm:text-base leading-relaxed mb-6">
            Puede haber sido un problema con la tarjeta o con MercadoPago. Tu carrito sigue guardado tal como lo dejaste, podés volver a intentar cuando quieras.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/checkout/entrega"
              className="bg-bib-red hover:bg-bib-white text-bib-black font-medium rounded px-6 py-3 uppercase tracking-widest text-xs transition-all duration-300"
            >
              Volver a intentar
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-bib-white/20 text-bib-white hover:bg-bib-white/10 font-medium rounded px-6 py-3 uppercase tracking-widest text-xs transition-all duration-300"
            >
              <MessageCircle size={16} />
              Necesito ayuda por WhatsApp
            </a>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}