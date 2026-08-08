import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Hammer, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import ProductGrid from './ProductGrid';
import FadeIn from './FadeIn';
import { supabase } from '../supabaseClient';
import { CATEGORIES } from '../config/categories';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://bib-mates-backend.onrender.com";

const MARQUEE_TEXT = "🔥 20% OFF PAGANDO CON TRANSFERENCIA • ENVÍO GRATIS EN COMPRAS DESDE $120.000 • HASTA 3 CUOTAS SIN INTERÉS • ";

// Imagen de respaldo si una categoría no tiene productos cargados
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1597075095304-469b6a90807b?auto=format&fit=crop&q=80&w=500';

export default function Home() {
  const [categoryImages, setCategoryImages] = useState({});
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [destacados, setDestacados] = useState([]);
  const carouselRef = useRef(null);
  const destacadosRef = useRef(null);

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

    async function fetchDestacados() {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('destacado', true)
        .or('archivado.eq.false,archivado.is.null');

      if (!error && data) setDestacados(data);
    }

    async function fetchFaqs() {
      try {
        setLoadingFaqs(true);
        const res = await fetch(`${BACKEND_URL}/api/faqs`);
        const data = await res.json();
        if (res.ok) setFaqs(data);
      } catch (err) {
        console.error('Error cargando FAQs:', err);
      } finally {
        setLoadingFaqs(false);
      }
    }

    fetchCategoryImages();
    fetchDestacados();
    fetchFaqs();
  }, []);

  const scroll = (direction, ref = carouselRef) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
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
              Tomar mate<br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bib-white via-[#C4A278] to-bib-white">
                siempre es una buena idea.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-xs sm:text-sm md:text-base text-bib-gray tracking-wide max-w-xl mb-10 leading-relaxed font-light drop-shadow">
             En esta Tienda vas a encontrar mates imperiales, torpedos, camioneros, algarrobos, termos , cánastas materas, yerbas uruguayas  y más
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Productos Destacados */}
      {destacados.length > 0 && (
        <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-8 space-y-1">
              <p className="text-[10px] tracking-[0.3em] text-[#C4A278] uppercase font-bold">Selección especial</p>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-bib-white">
                Productos Destacados
              </h2>
            </div>
          </FadeIn>

          <div className="relative group">
            <button
              onClick={() => scroll('left', destacadosRef)}
              aria-label="Anterior"
              className="absolute left-0 top-[40%] -translate-y-1/2 z-20 bg-bib-black/80 text-bib-white hover:text-[#C4A278] p-2 rounded-full border border-bib-white/20 shadow-lg backdrop-blur-sm -translate-x-2 sm:translate-x-0 transition-all duration-200"
            >
              <ChevronLeft size={18} />
            </button>

            <div
              ref={destacadosRef}
              className="flex overflow-x-auto gap-4 sm:gap-5 pb-4 px-2 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            >
              {destacados.map((p, i) => {
                const precioFinal = p.descuento_porcentaje > 0
                  ? p.price * (1 - p.descuento_porcentaje / 100)
                  : p.price;

                return (
                  <FadeIn key={p.id} delay={i * 60} className="shrink-0 w-56 sm:w-64 snap-start">
                    <div className="group/dest rounded overflow-hidden border border-bib-white/10 hover:border-[#C4A278] transition-all duration-300 bg-bib-dark h-full flex flex-col">
                      <Link to={`/producto/${p.id}`} className="relative aspect-[4/3] overflow-hidden bg-bib-black block">
                        <img
                          src={p.image_url || FALLBACK_IMAGE}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover/dest:scale-110 transition-transform duration-500"
                        />
                        {p.descuento_porcentaje > 0 && (
                          <span className="absolute top-2 left-2 bg-[#C4A278] text-bib-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                            {p.descuento_porcentaje}% OFF
                          </span>
                        )}
                      </Link>
                      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
                        <Link to={`/producto/${p.id}`}>
                          <p className="text-sm sm:text-base font-medium text-bib-white truncate group-hover/dest:text-[#C4A278] transition-colors">
                            {p.name}
                          </p>
                        </Link>
                        <div className="flex items-baseline gap-2 mt-1.5 mb-3">
                          {p.descuento_porcentaje > 0 && (
                            <span className="text-xs text-bib-gray line-through">
                              ${Number(p.price).toLocaleString('es-AR')}
                            </span>
                          )}
                          <span className="text-base sm:text-lg font-bold text-bib-white">
                            ${Number(precioFinal).toLocaleString('es-AR')}
                          </span>
                        </div>
                        <Link
                          to={`/producto/${p.id}`}
                          className="mt-auto inline-flex items-center justify-center gap-1.5 bg-[#C4A278] text-bib-black py-2.5 rounded font-bold text-[11px] tracking-[0.15em] uppercase hover:bg-bib-white transition-all duration-300"
                        >
                          Comprar
                          <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>

            <button
              onClick={() => scroll('right', destacadosRef)}
              aria-label="Siguiente"
              className="absolute right-0 top-[40%] -translate-y-1/2 z-20 bg-bib-black/80 text-bib-white hover:text-[#C4A278] p-2 rounded-full border border-bib-white/20 shadow-lg backdrop-blur-sm translate-x-2 sm:translate-x-0 transition-all duration-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      )}

      {/* Métricas de Confianza (Movidas aquí abajo) */}
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
                <p className="text-xs text-bib-gray">Tu nombre,frase o logo grabado en el mate</p>
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

      {/* Sección de Preguntas Frecuentes (FAQ) - ahora dinámica desde Supabase/admin */}
      {!loadingFaqs && faqs.length > 0 && (
        <section id="faqs" className="max-w-4xl mx-auto py-16 px-4 sm:px-6 border-t border-bib-white/10 scroll-mt-24">
          <FadeIn>
            <div className="text-center mb-10 space-y-2">
              <p className="text-[10px] tracking-[0.3em] text-[#C4A278] uppercase font-bold">Resolvé tus dudas</p>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-bib-white">
                Preguntas Frecuentes
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === faq.id;
              return (
                <FadeIn key={faq.id} delay={index * 50}>
                  <div className="border border-bib-white/10 rounded-lg overflow-hidden bg-bib-black/40 transition-colors hover:border-[#C4A278]/40">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none"
                    >
                      <span className="text-sm sm:text-base font-semibold text-bib-white">
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-[#C4A278] shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-bib-gray leading-relaxed border-t border-bib-white/5 pt-3 whitespace-pre-wrap">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}