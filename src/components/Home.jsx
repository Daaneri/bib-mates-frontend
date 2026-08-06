import { Link } from 'react-router-dom';
import { Truck, Star, CreditCard, Sparkles, ChevronRight } from 'lucide-react';
import ProductGrid from './ProductGrid';
import FadeIn from './FadeIn';

const FEATURED_CATEGORIES = [
  { name: 'Mates', image: 'https://images.unsplash.com/photo-1597075095304-469b6a90807b?auto=format&fit=crop&q=80&w=400' },
  { name: 'Termos', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400' },
  { name: 'Yerbas', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400' },
  { name: 'Canastas', image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=400' },
  { name: 'Bombillas', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400' },
  { name: 'Accesorios', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400' },
];

const MARQUEE_TEXT = "🔥 20% OFF PAGANDO CON MERCADO PAGO • ENVÍO GRATIS EN COMPRAS DESDE $120.000 • HASTA 3 CUOTAS SIN INTERÉS • ";

export default function Home() {
  return (
    <>
      {/* Ticker / Anuncio Superior */}
      <div className="overflow-hidden bg-[#C4A278] py-2 whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <span className="text-[11px] font-bold text-bib-black uppercase tracking-widest">
            {MARQUEE_TEXT.repeat(2)}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section
        className="relative py-20 md:py-32 px-6 text-center overflow-hidden flex flex-col items-center justify-center min-h-[75vh]"
        style={{
          background: 'radial-gradient(ellipse 700px 450px at 50% 20%, rgba(196,162,120,0.18), transparent), #0A0A0A',
        }}
      >
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-30 animate-pulse [animation-duration:5s]"
          style={{
            background: 'radial-gradient(circle, rgba(196,162,120,0.25) 0%, transparent 70%)',
          }}
        />

        <FadeIn>
          <span className="inline-flex items-center gap-1.5 bg-[#C4A278]/10 border border-[#C4A278]/30 px-3 py-1 rounded-full text-[10px] sm:text-xs tracking-[0.25em] text-[#C4A278] font-semibold mb-6 uppercase">
            <Sparkles size={12} /> Artesanías en Cuero y Alpaca
          </span>
        </FadeIn>

        <FadeIn delay={100}>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-bib-white tracking-tight mb-6 leading-[1.1] max-w-4xl">
            Tomar mate,<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bib-white via-[#C4A278] to-bib-white">
              siempre es una buena idea.
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="text-xs sm:text-sm md:text-base text-bib-gray tracking-wide max-w-xl mb-10 leading-relaxed font-light">
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
              className="inline-flex items-center justify-center gap-2 bg-transparent border border-bib-white/20 text-bib-white px-8 py-3.5 rounded font-medium text-xs tracking-[0.2em] uppercase hover:border-[#C4A278] hover:text-[#C4A278] transition-all duration-300"
            >
              Ver Grabados
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Métricas de Prueba Social */}
      <FadeIn>
        <section className="bg-bib-black border-y border-bib-white/10 py-6 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3 p-2">
              <Truck size={24} className="text-[#C4A278] shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold text-bib-white uppercase tracking-wider">+5.000 Envíos</p>
                <p className="text-xs text-bib-gray">A todo el país por Correo/Andreani</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-2 border-y md:border-y-0 md:border-x border-bib-white/10">
              <Star size={24} className="text-[#C4A278] fill-[#C4A278] shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold text-bib-white uppercase tracking-wider">4.9 / 5 Estrellas</p>
                <p className="text-xs text-bib-gray">Garantía de calidad artesanal</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-2">
              <CreditCard size={24} className="text-[#C4A278] shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold text-bib-white uppercase tracking-wider">Hasta 3 Cuotas</p>
                <p className="text-xs text-bib-gray">Sin interés con todas las tarjetas</p>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Tarjetas de Categorías con Imágenes */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <FadeIn>
          <div className="text-center mb-10 space-y-1">
            <p className="text-[10px] tracking-[0.3em] text-[#C4A278] uppercase font-bold">Colección completa</p>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-bib-white">
              Explorá por categoría
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {FEATURED_CATEGORIES.map(({ name, image }, i) => (
            <FadeIn key={name} delay={i * 50}>
              <a
                href={`/?category=${encodeURIComponent(name)}#seleccion`}
                className="group relative h-40 rounded overflow-hidden border border-bib-white/10 flex items-end p-3 transition-all duration-300 hover:border-[#C4A278]"
              >
                <img
                  src={image}
                  alt={name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bib-black via-bib-black/40 to-transparent" />
                <div className="relative z-10 w-full">
                  <span className="block text-xs font-bold text-bib-white tracking-widest uppercase group-hover:text-[#C4A278] transition-colors">
                    {name}
                  </span>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Grid de Productos */}
      <section id="seleccion" className="max-w-7xl mx-auto py-8 pb-20 px-4 sm:px-6">
        <ProductGrid />
      </section>
    </>
  );
}