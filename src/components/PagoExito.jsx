import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../config/site';
import FadeIn from './FadeIn';

export default function PagoExito() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <FadeIn>
        <div className="max-w-md w-full text-center bg-bib-dark border border-bib-white/10 rounded p-8 sm:p-12">
          <CheckCircle2 size={52} className="text-green-400 mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-bib-white mb-3 lowercase">
            ¡tu pago se acreditó!
          </h1>
          <p className="text-bib-gray text-sm sm:text-base leading-relaxed mb-2">
            Ya recibimos tu pedido y te vamos a contactar por WhatsApp para coordinar la entrega.
          </p>
          {externalReference && (
            <p className="text-bib-gray/60 text-xs mb-6">Pedido #{externalReference}</p>
          )}

          <div className="flex flex-col gap-3 mt-6">
            <Link
              to="/"
              className="bg-bib-red hover:bg-bib-white text-bib-black font-medium rounded px-6 py-3 uppercase tracking-widest text-xs transition-all duration-300"
            >
              Volver al inicio
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-bib-white/20 text-bib-white hover:bg-bib-white/10 font-medium rounded px-6 py-3 uppercase tracking-widest text-xs transition-all duration-300"
            >
              <MessageCircle size={16} />
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}