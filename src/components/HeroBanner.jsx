import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import FadeIn from './FadeIn';

export default function HeroBanner() {
  return (
    <section className="relative py-20 md:py-32 px-6 text-center overflow-hidden flex flex-col items-center justify-center min-h-[75vh] bg-bib-black">
      {/* Foto de fondo del cliente */}
      <img
        src="/banner-mate-cliente.jpg.jpeg"
        alt="Mate artesanal"
        className="absolute inset-0 w-full h-full object-cover object-[center_30%] md:object-[right_center]"
      />

      {/* Overlay liviano: deja ver la foto, el contraste del texto lo da la sombra fuerte del propio título */}
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-30 animate-pulse [animation-duration:5s]"
        style={{
          background: 'radial-gradient(circle, rgba(196,162,120,0.25) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <FadeIn delay={100}>
          <h1 className="font-heading font-extrabold text-bib-white tracking-tight mb-6 max-w-4xl">
            <span
              className="block text-4xl sm:text-6xl md:text-7xl leading-[1.15]"
              style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.65)' }}
            >
              Tomar mate,
            </span>
            <span
              className="block mt-2 sm:mt-3 text-4xl sm:text-6xl md:text-7xl leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-bib-white via-[#C4A278] to-bib-white"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9)) drop-shadow(0 8px 24px rgba(0,0,0,0.65))' }}
            >
              siempre es una buena idea.
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p
            className="text-xs sm:text-sm md:text-base text-bib-gray tracking-wide max-w-xl mb-10 leading-relaxed font-light"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.85)' }}
          >
            Mates imperiales y camioneros seleccionados a mano, grabados láser personalizados y complementos de calidad premium.
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a
              href="#seleccion"
              className="inline-flex items-center justify-center gap-2 bg-[#C4A278] text-bib-black px-8 py-3.5 rounded font-bold text-xs tracking-[0.2em] uppercase hover:bg-bib-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(196,162,120,0.4)] hover:-translate-y-0.5"
            >
              Ver Catálogo
              <ChevronRight size={14} />
            </a>
            <Link
              to="/grabados"
              className="inline-flex items-center justify-center gap-2 bg-transparent border border-bib-white/20 text-bib-white px-8 py-3.5 rounded font-medium text-xs tracking-[0.2em] uppercase hover:border-[#C4A278] hover:text-[#C4A278] transition-all duration-300 backdrop-blur-sm"
            >
              Ver Grabados
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}