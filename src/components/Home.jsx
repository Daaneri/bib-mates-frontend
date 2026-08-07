import { useEffect, useRef, useState } from 'react';
import { Truck, Star, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import ProductGrid from './ProductGrid';
import FadeIn from './FadeIn';
import HeroBanner from './HeroBanner';
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
      // Traemos id, category e image_url de productos con foto
      const { data, error } = await supabase
        .from('productos')
        .select('category, image_url')
        .not('image_url', 'is', null)
        .neq('image_url', '');

      if (!error && data) {
        const imageMap = {};
        // Guardamos la primera imagen encontrada para cada categoría
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

  // Función para desplazarse lateralmente
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

      {/* Hero Banner Component */}
      <HeroBanner />

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

        {/* Contenedor relativo para posicionar las flechas sobre el carrusel */}
        <div className="relative group">
          {/* Flecha Izquierda */}
          <button
            onClick={() => scroll('left')}
            aria-label="Anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-bib-black/80 text-bib-white hover:text-[#C4A278] p-2 rounded-full border border-bib-white/20 shadow-lg backdrop-blur-sm -translate-x-2 sm:translate-x-0 transition-all duration-200"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Carrusel Deslizable */}
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

          {/* Flecha Derecha */}
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