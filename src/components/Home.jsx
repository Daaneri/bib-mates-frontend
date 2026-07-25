import { Link } from 'react-router-dom';
import { Coffee, Thermometer, Leaf, ShoppingBasket, Package, Gem } from 'lucide-react';
import ProductGrid from './ProductGrid';
import { siteConfig } from '../config/site';

const FEATURED_CATEGORIES = [
  { name: 'Mates', icon: Coffee },
  { name: 'Termos', icon: Thermometer },
  { name: 'Yerbas', icon: Leaf },
  { name: 'Canastas', icon: ShoppingBasket },
  { name: 'Kits', icon: Package },
  { name: 'Accesorios', icon: Gem },
];

const MARQUEE_TEXT = "TOMAR MATE ES SIEMPRE UNA BUENA IDEA \u2022 ENVÍOS A TODO EL PAÍS \u2022 ENVÍO GRATIS DESDE $120.000 \u2022 HECHO PARA VOS \u2022 ";

export default function Home() {
  return (
    <>
      <div className="overflow-hidden bg-bib-red py-2 whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <span className="text-[11px] font-medium text-bib-black tracking-widest">
            {MARQUEE_TEXT.repeat(2)}
          </span>
        </div>
      </div>

      <section
        className="py-16 md:py-28 px-6 text-center"
        style={{
          background: 'radial-gradient(ellipse 600px 350px at 50% 0%, rgba(196,162,120,0.15), transparent), #0A0A0A',
        }}
      >
        <p className="text-xs tracking-[0.3em] text-bib-red font-medium mb-3 uppercase">
          Envíos a todo el país
        </p>
        <h1 className="text-5xl md:text-7xl font-heading font-bold text-bib-white tracking-tight mb-6 leading-tight lowercase">
          {siteConfig.tagline}
        </h1>
        <p className="text-xs md:text-sm text-bib-gray tracking-[0.2em] uppercase mb-10">
          Catálogo completo abajo
        </p>
        <a
          href="#seleccion"
          className="inline-block bg-bib-red text-bib-white px-10 py-3 rounded text-xs tracking-[0.2em] uppercase font-medium hover:bg-bib-white hover:text-bib-black transition-colors duration-300"
        >
          Ver Catálogo
        </a>
      </section>

      <section className="grid grid-cols-3 divide-x divide-bib-white/10 border-y border-bib-white/10">
        <div className="py-4 sm:py-6 text-center">
          <p className="text-xl sm:text-2xl font-medium text-bib-white">+100</p>
          <p className="text-[10px] sm:text-xs text-bib-gray tracking-widest uppercase mt-1">Productos</p>
        </div>
        <div className="py-4 sm:py-6 text-center">
          <p className="text-xl sm:text-2xl font-medium text-bib-white">9</p>
          <p className="text-[10px] sm:text-xs text-bib-gray tracking-widest uppercase mt-1">Categorías</p>
        </div>
        <div className="py-4 sm:py-6 text-center">
          <p className="text-xl sm:text-2xl font-medium text-bib-white">2</p>
          <p className="text-[10px] sm:text-xs text-bib-gray tracking-widest uppercase mt-1">Puntos de retiro</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto py-12 sm:py-16 px-6">
        <h2 className="text-2xl font-heading font-bold text-bib-white mb-8 text-center lowercase">
          explorá por categoría
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {FEATURED_CATEGORIES.map(({ name, icon: Icon }) => (
            <a
              key={name}
              href="#seleccion"
              className="flex flex-col items-center gap-2 bg-bib-dark border border-bib-white/10 rounded p-4 hover:border-bib-red/50 transition-colors"
            >
              <Icon size={22} className="text-bib-red" />
              <span className="text-[10px] text-bib-white tracking-widest uppercase">{name}</span>
            </a>
          ))}
        </div>
      </section>

      <section id="seleccion" className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-2xl font-heading font-bold text-bib-white mb-10 text-center lowercase">
          nuestra selección
        </h2>
        <ProductGrid />
      </section>
    </>
  );
}