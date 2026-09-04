import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import FadeIn from './FadeIn';

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[85vh] min-h-[550px] max-h-[800px] bg-bib-black overflow-hidden flex flex-col justify-between py-8 px-6">
      {/* Foto de fondo */}
      <img
        src="/banner-mate-cliente.jpg.jpeg"
        alt="Mate artesanal"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Overlay para dar legibilidad en extremos y dejar centro iluminado */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/35" />

      {/* 1. TÍTULO EN LA PARTE SUPERIOR */}
      <div className="relative z-10 w-full text-center pt-2">
        <FadeIn delay={100}>
          <h1 className="tracking-tight text-bib-white max-w-3xl mx-auto" style={{ fontFamily: "'Anton', sans-serif" }}>
            <span
              className="block text-4xl sm:text-6xl md:text-7xl leading-none uppercase"
              style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
            >
              Tomar mate,
            </span>
            <span
              className="block text-4xl sm:text-6xl md:text-7xl leading-none uppercase"
              style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
            >
              siempre es una
            </span>
            <span
              className="block text-4xl sm:text-6xl md:text-7xl leading-none uppercase"
              style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
            >
              buena idea.
            </span>
          </h1>
        </FadeIn>
      </div>

      {/* ZONA CENTRAL LIBRE (MATE) */}
      <div className="flex-1 pointer-events-none" />

      {/* 2. TARJETA Y BOTONES EN LA PARTE INFERIOR */}
      <div className="relative z-10 w-full flex flex-col items-center gap-4 text-center pb-2">
        <FadeIn delay={200}>
          <div className="bg-black/25 backdrop-blur-[1px] px-6 py-3.5 rounded-2xl max-w-xl border border-white/10 shadow-2xl mx-auto">
            <p
              className="text-xs sm:text-sm text-gray-200 tracking-wide leading-relaxed font-medium"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
            >
              En esta Tienda vas a encontrar mates imperiales, torpedos, camioneros, algarrobos, termos, canastas materas, yerbas uruguayas y más
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="flex flex-row gap-3 justify-center items-center">
            <a
              href="#seleccion"
              className="inline-flex items-center justify-center gap-2 bg-black text-white border border-white/20 px-6 py-2.5 rounded-xl font-bold text-xs tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
            >
              Ver Catálogo
              <ChevronRight size={14} />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}