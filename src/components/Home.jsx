import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Hammer, ChevronRight, ChevronLeft } from 'lucide-react';
import ProductGrid from './ProductGrid';
import FadeIn from './FadeIn';
import { supabase } from '../supabaseClient';
import { CATEGORIES } from '../config/categories';

const MARQUEE_TEXT = "🔥 20% OFF PAGANDO CON MERCADO PAGO • ENVÍO GRATIS EN COMPRAS DESDE $120.000 • HASTA 3 CUOTAS SIN INTERÉS • ";

// Imagen de respaldo si una categoría no tiene productos cargados
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1597075095304-469b6a90807b?auto=format&fit=crop&q=80&w=500';

export default function Home() {
  const [categoryImages, setCategoryImages] = useState({});
  const carouselRef = useRef(null);

  useEffect(() => {
    async function fetchCategoryImages() {
      const { data, error } = await supabase
        .from('productos')
        .select('category, image_url')
        .not('image_url', 'is', null)
        .neq('image_url', '');

      if (!error && data) {
        const imageMap = {};
        data.forEach(item => {
          if (item.category && item.image_url && !imageMap[item.category.toLowerCase()]) {
            imageMap[item.category.toLowerCase()] = item.image_url;
          }
        });
        setCategoryImages(imageMap);
      }
    }

    fetchCategoryImages();
  }, []);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
        className="relative py-20 md:py-32 px-6 text-center overflow-hidden flex flex-col items-center justify-center min-h-[75vh] bg-bib-black"
      >
        <img
          src="/banner-mate-cliente.jpg.jpeg"
          alt="Mate artesanal con sol"
          className="absolute inset-0 w-full h-full object-cover object-[center_45%] scale-105 sm:scale-100 transition-transform duration-700"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div 
          className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C4A278]/25 rounded-full blur-[120px] opacity-80"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center justify-center">
          <FadeIn delay={100}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-bib-white tracking-tight mb-6 leading-[1.1] max-w-4xl drop-shadow-md">
              Tomar mate,<br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bib-white via-[#C4A278] to-bib-white">
                siempre es una buena idea.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-xs sm:text-sm md:text-base text-bib-gray tracking-wide max-w-xl mb-10 leading-relaxed font-light drop-shadow">
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

      {/* Métricas de Confianza (Actualizadas sin repetir cuotas) */}
      <FadeIn>
        <section className="bg-bib-black border-y border-bib-white/10 py-6 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            
            <div className="flex items-center justify-center gap-3 p-2">
              <Hammer size={24} className="text-[#C4A278] shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold text-bib-white uppercase tracking-wider">100% Artesanales</p>
                <p className="text-xs text-bib-gray">Seleccionados y armados a mano</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-2 border-y md:border-y-0 md:border-x border-bib-white/10">
              <Sparkles size={24} className="text-[#C4A278] shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold text-bib-white uppercase tracking-wider">Grabado Láser</p>
                <p className="text-xs text-bib-gray">Personalización única en el acto</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-2">
              <ShieldCheck size={24} className="text-[#C4A278] shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold text-bib-white uppercase tracking-wider">Compra Segura</p>
                <p className="text-xs text-bib-gray">Protección en todo tu proceso de pago</p>
              </div>
            </div>

          </div>
        </section>
      </FadeIn>

      {/* Tarjetas de Categorías Dinámicas con Flechas de Navegación */}
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
        <FadeIn>
          <div className="text-center mb-8 space-y-1">
            <p className="text-[10px] tracking-[0.3em] text-[#C4A278] uppercase font-bold">Colección completa</p>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-bib-white">
              Explorá por categoría
            </h2>
          </div>
        </FadeIn>

        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            aria-label="Anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-bib-black/80 text-bib-white hover:text-[#C4A278] p-2 rounded-full border border-bib-white/20 shadow-lg backdrop-blur-sm -translate-x-2 sm:translate-x-0 transition-all duration-200"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 px-2 scrollbar-hide snap-x snap-mandatory scroll-smooth"
          >
            {CATEGORIES.map((catName, i) => {
              const imageUrl = categoryImages[catName.toLowerCase()] || FALLBACK_IMAGE;

              return (
                <FadeIn key={catName} delay={i * 40} className="shrink-0 w-36 sm:w-44 lg:w-48 snap-start">
                  <a
                    href={`/?category=${encodeURIComponent(catName)}#seleccion`}
                    className="group/item relative h-36 sm:h-40 rounded overflow-hidden border border-bib-white/10 flex items-end p-3 transition-all duration-300 hover:border-[#C4A278]"
                  >
                    <img
                      src={imageUrl}
                      alt={catName}
                      className="absolute inset-0 w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500 opacity-60 group-hover/item:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bib-black via-bib-black/40 to-transparent" />
                    <div className="relative z-10 w-full">
                      <span className="block text-xs font-bold text-bib-white tracking-widest uppercase group-hover/item:text-[#C4A278] transition-colors truncate">
                        {catName}
                      </span>
                    </div>
                  </a>
                </FadeIn>
              );
            })}
          </div>

          <button
            onClick={() => scroll('right')}
            aria-label="Siguiente"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-bib-black/80 text-bib-white hover:text-[#C4A278] p-2 rounded-full border border-bib-white/20 shadow-lg backdrop-blur-sm translate-x-2 sm:translate-x-0 transition-all duration-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Grid de Productos */}
      <section id="seleccion" className="max-w-7xl mx-auto py-4 pb-20 px-4 sm:px-6">
        <ProductGrid hideCategoryBar={true} />
      </section>
    </>
  );
}