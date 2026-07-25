import { siteConfig } from '../config/site';

export default function Footer() {
  return (
    <footer className="mt-12 sm:mt-20 py-10 sm:py-16 bg-bib-dark border-t border-bib-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-center md:text-left">

        <div className="flex flex-col gap-2 items-center md:items-start">
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-bib-white lowercase">{siteConfig.businessName}</h3>
          <p className="text-sm text-bib-gray">{siteConfig.tagline}</p>
        </div>

        <div className="flex flex-col gap-3 items-center md:items-start">
          <h4 className="font-medium uppercase tracking-widest text-xs text-bib-gray mb-1">Contacto</h4>

          <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 text-bib-gray hover:text-bib-red transition text-sm sm:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>{siteConfig.whatsappDisplay}</span>
          </a>

          <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 text-bib-gray hover:text-bib-red transition text-sm sm:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            <span>@{siteConfig.social.instagram.split('/').pop()}</span>
          </a>
        </div>

        <div className="flex flex-col gap-2 items-center md:items-end">
          <p className="text-xs sm:text-sm text-bib-gray/60">© 2026 {siteConfig.businessName.toLowerCase().replace(/\s+/g, '.')}.</p>
          <p className="text-[10px] sm:text-xs text-bib-gray/40 mt-1">
            Hecho por <a href="https://www.instagram.com/desarrollando.andoo/" target="_blank" rel="noopener noreferrer" className="hover:text-bib-white underline transition-colors">Desarrollando.andoo</a>
          </p>
        </div>

      </div>
    </footer>
  );
}