import { Link } from 'react-router-dom';
import { Coffee, Thermometer, Leaf, ShoppingBasket, Package, Gem } from 'lucide-react';
import ProductGrid from './ProductGrid';
import FadeIn from './FadeIn';
import { siteConfig } from '../config/site';

const FEATURED_CATEGORIES = [
  { name: 'Mates', icon: Coffee },
  { name: 'Termos', icon: Thermometer },
  { name: 'Yerbas', icon: Leaf },
  { name: 'Canastas', icon: ShoppingBasket },
  { name: 'Kits', icon: Package },
  { name: 'Accesorios', icon: Gem },
];

const MARQUEE_TEXT = "TOMAR MATE ES SIEMPRE UNA BUENA IDEA • ENVÍOS A TODO EL PAÍS • ENVÍO GRATIS DESDE $120.000 • HECHO PARA VOS • ";

export default function Home() {
  return (
    <>
      <div className="overflow-hidden bg-bib-red-dark py-2 whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <span className="text-[11px] font-medium text-bib-black tracking-widest">
            {MARQUEE_TEXT.repeat(2)}
          </span>
        </div>
      </div>

      <section
        className="relative py-16 md:py-28 px-6 text-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 600px 350px at 50% 0%, rgba(196,162,120,0.15), transparent), #0A0A0A',
        }}
      >
        {/* Glow ambiental sutil, en movimiento lento */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-40 animate-pulse [animation-duration:4s]"
          style={{
            background: 'radial-gradient(circle, rgba(196,162,120,0.18) 0%, transparent 70%)',
          }}
        />

        <FadeIn>
          <p className="text-xs tracking-[0.3em] text-bib-red font-medium mb-3 uppercase">
            Envíos a todo el país
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-bib-white tracking-tight mb-6 leading-tight relative">
            {siteConfig.tagline.split(',').map((linea, i) => {
              const texto = linea.trim();
              const formateado = i === 0
                ? texto.charAt(0).toUpperCase() + texto.slice(1)
                : texto;
              return (
                <span key={i} className="block lowercase first-letter:uppercase">
                  {i === 0 ? formateado : texto}{i === 0 ? ',' : ''}
                </span>
              );
            })}
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="text-xs md:text-sm text-bib-gray tracking-[0.2em] uppercase mb-10">
            Catálogo completo abajo
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <a
            href="#seleccion"
            className="group inline-flex items-center gap-2 bg-bib-red text-bib-white px-10 py-3 rounded text-xs tracking-[0.2em] uppercase font-medium hover:bg-bib-white hover:text-bib-black transition-all duration-300 hover:shadow-[0_0_25px_rgba(196,162,120,0.35)] hover:-translate-y-0.5"
          >
            Ver Catálogo
            <span className="transition-transform duration-300 group-hover:translate-y-1">↓</span>
          </a>
        </FadeIn>
      </section>

      <FadeIn>
        <section className="grid grid-cols-3 divide-x divide-bib-white/10 border-y border-bib-white/10">
          <div className="py-4 sm:py-6 text-center transition-colors duration-300 hover:bg-bib-white/[0.02]">
            <p className="text-xl sm:text-2xl font-medium text-bib-white">+100</p>
            <p className="text-[10px] sm:text-xs text-bib-gray tracking-widest uppercase mt-1">Productos</p>
          </div>
          <div className="py-4 sm:py-6 text-center transition-colors duration-300 hover:bg-bib-white/[0.02]">
            <p className="text-xl sm:text-2xl font-medium text-bib-white">9</p>
            <p className="text-[10px] sm:text-xs text-bib-gray tracking-widest uppercase mt-1">Categorías</p>
          </div>
          <div className="py-4 sm:py-6 text-center transition-colors duration-300 hover:bg-bib-white/[0.02]">
            <p className="text-xl sm:text-2xl font-medium text-bib-white">2</p>
            <p className="text-[10px] sm:text-xs text-bib-gray tracking-widest uppercase mt-1">Puntos de retiro</p>
          </div>
        </section>
      </FadeIn>

      <section className="max-w-4xl mx-auto py-12 sm:py-16 px-6">
        <FadeIn>
          <h2 className="text-2xl font-heading font-bold text-bib-white mb-8 text-center lowercase">
            explorá por categoría
          </h2>
        </FadeIn>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {FEATURED_CATEGORIES.map(({ name, icon: Icon }, i) => (
            <FadeIn key={name} delay={i * 60}>
              <a
                href={`/?categoria=${encodeURIComponent(name)}#seleccion`}
                className="group flex flex-col items-center gap-2 bg-bib-dark border border-bib-white/10 rounded p-4 hover:border-bib-red/50 hover:-translate-y-1 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] transition-all duration-300"
              >
                <Icon size={22} className="text-bib-red transition-transform duration-300 group-hover:scale-110" />
                <span className="text-[10px] text-bib-white tracking-widest uppercase">{name}</span>
              </a>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="seleccion" className="max-w-7xl mx-auto py-12 px-6">
        <FadeIn>
          <h2 className="text-2xl font-heading font-bold text-bib-white mb-10 text-center lowercase">
            nuestra selección
          </h2>
        </FadeIn>
        <ProductGrid />
      </section>
    </>
  );
}