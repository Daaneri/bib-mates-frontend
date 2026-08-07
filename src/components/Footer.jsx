import { Link } from 'react-router-dom';
import { CreditCard, Wallet, Banknote, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../config/site';

export default function Footer() {
  return (
    <footer className="mt-12 sm:mt-20 py-10 sm:py-16 bg-bib-dark border-t border-bib-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 text-center md:text-left">

        {/* Sección Marca */}
        <div className="flex flex-col gap-2 items-center md:items-start">
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-bib-white lowercase">{siteConfig.businessName}</h3>
          <p className="text-sm text-bib-gray">{siteConfig.tagline}</p>
        </div>

        {/* Sección Enlaces / FAQ */}
        <div className="flex flex-col gap-3 items-center md:items-start">
          <h4 className="font-medium uppercase tracking-widest text-xs text-bib-gray mb-1">Navegación</h4>
          <Link to="/" className="text-bib-gray hover:text-bib-red transition text-sm">
            Inicio
          </Link>
          <a href="/#faqs" className="text-[#C4A278] hover:text-bib-white transition text-sm font-semibold text-center md:text-left">
            Preguntas Frecuentes
          </a>
          <Link to="/grabados" className="text-bib-gray hover:text-bib-red transition text-sm">
            Grabados Personalizados
          </Link>
        </div>

        {/* Sección Contacto */}
        <div className="flex flex-col gap-3 items-center md:items-start">
          <h4 className="font-medium uppercase tracking-widest text-xs text-bib-gray mb-1">Contacto</h4>

          <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 text-bib-gray hover:text-bib-red transition text-sm sm:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>{siteConfig.whatsappDisplay}</span>
          </a>

          <a href={`mailto:${siteConfig.email}`} className="flex items-center justify-center md:justify-start gap-2 text-bib-gray hover:text-bib-red transition text-sm sm:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span className="truncate">{siteConfig.email}</span>
          </a>

          <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 text-bib-gray hover:text-bib-red transition text-sm sm:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            <span>@{siteConfig.social.instagram.split('/').pop()}</span>
          </a>
        </div>

        {/* Sección Compra Segura */}
        <div className="flex flex-col gap-2 items-center md:items-start">
          <h4 className="font-medium uppercase tracking-widest text-xs text-bib-gray mb-1">Compra Segura</h4>
          <div className="flex items-center gap-2 text-xs text-[#C4A278]">
            <ShieldCheck size={18} />
            <span>Garantía de calidad en todos los productos</span>
          </div>
        </div>

      </div>

      {/* BLOQUE DE MEDIOS DE PAGO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-bib-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-bib-white/80">
          <span className="text-[11px] uppercase tracking-wider text-bib-gray mr-1">Medios de pago:</span>
          
          <div className="flex items-center gap-1.5 bg-bib-black border border-bib-white/10 px-2.5 py-1 rounded text-[11px]">
            <CreditCard size={14} className="text-[#C4A278]" />
            <span>Tarjetas de Crédito / Débito</span>
          </div>

          <div className="flex items-center gap-1.5 bg-bib-black border border-bib-white/10 px-2.5 py-1 rounded text-[11px]">
            <Wallet size={14} className="text-[#009EE3]" />
            <span>Mercado Pago</span>
          </div>

          <div className="flex items-center gap-1.5 bg-bib-black border border-bib-white/10 px-2.5 py-1 rounded text-[11px]">
            <Banknote size={14} className="text-green-500" />
            <span>Transferencia / Efectivo</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-center md:text-right">
          <p className="text-xs sm:text-sm text-bib-gray/60">© {new Date().getFullYear()} {siteConfig.businessName.toLowerCase().replace(/\s+/g, '.')}.</p>
          <p className="text-[10px] sm:text-xs text-bib-gray/40">
            Hecho por <a href="https://www.instagram.com/desarrollando.andoo/" target="_blank" rel="noopener noreferrer" className="hover:text-bib-white underline transition-colors">Desarrollando.andoo</a>
          </p>
        </div>
      </div>
    </footer>
  );
}