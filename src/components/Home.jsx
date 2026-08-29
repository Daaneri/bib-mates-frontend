import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Sparkles, Hammer, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import ProductGrid from './ProductGrid';
import FadeIn from './FadeIn';
import { supabase } from '../supabaseClient';
import { CATEGORIES } from '../config/categories';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://bib-mates-backend.onrender.com";

const MARQUEE_TEXT = "🔥 20% OFF PAGANDO CON TRANSFERENCIA • ENVÍO GRATIS EN COMPRAS DESDE $120.000 • HASTA 3 CUOTAS SIN INTERÉS • ";

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1597075095304-469b6a90807b?auto=format&fit=crop&q=80&w=500';

export default function Home() {
  const location = useLocation();
  const [categoryImages, setCategoryImages] = useState({});
  const [subcategories, setSubcategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [destacados, setDestacados] = useState([]);
  const carouselRef = useRef(null);
  const destacadosRef = useRef(null);

  // Scroll automático a #seleccion al detectar hash o parámetros de búsqueda
  useEffect(() => {
    if (location.hash === '#seleccion' || location.search) {
      const timer = setTimeout(() => {
        const section = document.getElementById('seleccion');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location]);

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

    async function fetchSubcategories() {
      const { data } = await supabase.from('subcategorias').select('*');
      if (data) {
        setSubcategories(data);
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
    fetchSubcategories();
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

  // Subcategorías de la categoría actualmente seleccionada
  const activeSubcategories = openCategory 
    ? subcategories.filter(
        (sub) => (sub.categoria_nombre || sub.categoria || '').toLowerCase().trim() === openCategory.toLowerCase().trim()
      )
    : [];

  return (
    <>
      {/* Ticker / Anuncio Superior */}
      <div className="overflow-hidden bg-black border-b border-white/10 py-2 whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <span className="text-[11px] font-bold text-white uppercase tracking-widest">
            {MARQUEE_TEXT.repeat(2)}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-6 text-center overflow-hidden flex flex-col items-center justify-center min-h-[75vh] bg-bib-black">
        <img
          src="/banner-mate-cliente.jpg.jpeg"
          alt="Mate artesanal con sol"
          className="absolute inset-0 w-full h-full object-cover object-[center_45%] scale-105 sm:scale-100 transition-transform duration-700"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

        <div 
          className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/10 rounded-full blur-[120px] opacity-80"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center justify-center">
          <FadeIn delay={100}>
            <h1 className="font-heading font-extrabold tracking-tight mb-6 max-w-4xl">
              <span
                className="block text-4xl sm:text-6xl md:text-7xl leading-[1.15]"
                style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.65)' }}
              >
                Tomar mate,
              </span>
              <span
                className="block mt-2 sm:mt-3 text-4xl sm:text-6xl md:text-7xl leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white"
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
              En esta Tienda vas a encontrar mates imperiales, torpedos, camioneros, algarrobos, termos, canastas materas, yerbas uruguayas y más
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Productos Destacados */}
      {destacados.length > 0 && (
        <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-8 space-y-1">
              <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase font-bold">Selección especial</p>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">
                Productos Destacados
              </h2>
            </div>
          </FadeIn>

          <div className="relative group">
            <button
              onClick={() => scroll('left', destacadosRef)}
              aria-label="Anterior"
              className="absolute left-0 top-[40%] -translate-y-1/2 z-20 bg-black/80 text-white hover:bg-black p-2 rounded-full border border-white/20 shadow-lg backdrop-blur-sm -translate-x-2 sm:translate-x-0 transition-all duration-300 active:scale-90"
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

                const valorCuota = (precioFinal / 3).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                const precioTransferencia = (precioFinal * 0.8).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

                return (
                  <FadeIn key={p.id} delay={i * 60} className="shrink-0 w-56 sm:w-64 snap-start">
                    <div className="group/dest rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-gray-400 hover:shadow-xl transition-all duration-300 ease-out h-full flex flex-col">
                      <Link to={`/producto/${p.id}`} className="relative aspect-[4/3] overflow-hidden bg-gray-100 block">
                        <img
                          src={p.image_url || FALLBACK_IMAGE}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover/dest:scale-105 transition-transform duration-500 ease-out"
                        />
                        {p.descuento_porcentaje > 0 && (
                          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-md">
                            {p.descuento_porcentaje}% OFF
                          </span>
                        )}
                      </Link>
                      
                      <div className="p-4 flex flex-col flex-1">
                        <Link to={`/producto/${p.id}`}>
                          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate hover:text-black transition-colors">
                            {p.name}
                          </p>
                        </Link>
                        
                        <div className="flex items-baseline gap-2 mt-1">
                          {p.descuento_porcentaje > 0 && (
                            <span className="text-xs text-gray-400 line-through">
                              ${Number(p.price).toLocaleString('es-AR')}
                            </span>
                          )}
                          <span className="text-lg font-extrabold text-gray-900">
                            ${Number(precioFinal).toLocaleString('es-AR')}
                          </span>
                        </div>

                        <div className="mt-2 mb-4 space-y-2">
                          <p className="text-[11px] text-gray-500 font-medium">
                            3 cuotas sin interés de <span className="font-semibold text-gray-800">${valorCuota}</span>
                          </p>

                          {/* BADGE LIMPIO Y LEGIBLE */}
                          <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-500/30 p-1.5 rounded-xl">
                            <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0">
                              20% OFF
                            </span>
                            <span className="text-[11px] font-bold text-emerald-950 truncate">
                              ${precioTransferencia} <span className="text-gray-600 font-normal text-[10px]">c/ transferencia</span>
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/producto/${p.id}`}
                          className="mt-auto inline-flex items-center justify-center gap-1.5 bg-black text-white border border-black py-2.5 rounded-xl font-bold text-[11px] tracking-[0.15em] uppercase hover:bg-zinc-800 transition-all duration-300 active:scale-[0.98] shadow-sm"
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
              className="absolute right-0 top-[40%] -translate-y-1/2 z-20 bg-black/80 text-white hover:bg-black p-2 rounded-full border border-white/20 shadow-lg backdrop-blur-sm translate-x-2 sm:translate-x-0 transition-all duration-300 active:scale-90"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      )}

      {/* Métricas de Confianza */}
      <FadeIn>
        <section className="bg-bib-black border-y border-bib-white/10 py-6 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            
            <div className="flex items-center justify-center gap-3 p-2">
              <Hammer size={24} className="text-white shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold text-bib-white uppercase tracking-wider">100% Artesanales</p>
                <p className="text-xs text-bib-gray">Seleccionados y armados a mano</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-2 border-y md:border-y-0 md:border-x border-bib-white/10">
              <Sparkles size={24} className="text-white shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold text-bib-white uppercase tracking-wider">Grabado Láser</p>
                <p className="text-xs text-bib-gray">Tu nombre, frase o logo grabado en el mate</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-2">
              <ShieldCheck size={24} className="text-white shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold text-bib-white uppercase tracking-wider">Compra Segura</p>
                <p className="text-xs text-bib-gray">Protección en todo tu proceso de pago</p>
              </div>
            </div>

          </div>
        </section>
      </FadeIn>

      {/* Tarjetas de Categorías con Carrusel */}
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
        <FadeIn>
          <div className="text-center mb-8 space-y-1">
            <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase font-bold">Colección completa</p>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">
              Explorá por categoría
            </h2>
          </div>
        </FadeIn>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            aria-label="Anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/80 text-white hover:bg-black p-2 rounded-full border border-white/20 shadow-lg backdrop-blur-sm -translate-x-2 sm:translate-x-0 transition-all duration-300 active:scale-90"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 px-2 scrollbar-hide snap-x snap-mandatory scroll-smooth items-center"
          >
            {CATEGORIES.map((catName) => {
              const imageUrl = categoryImages[catName.toLowerCase()] || FALLBACK_IMAGE;
              const subsDeEstaCat = subcategories.filter(
                (sub) => (sub.categoria_nombre || sub.categoria || '').toLowerCase().trim() === catName.toLowerCase().trim()
              );
              const isSelected = openCategory === catName;

              return (
                <div key={catName} className="shrink-0 w-40 sm:w-48 snap-start">
                  <div
                    onClick={() => {
                      if (subsDeEstaCat.length > 0) {
                        setOpenCategory(isSelected ? null : catName);
                      } else {
                        window.location.href = `/?category=${encodeURIComponent(catName)}#seleccion`;
                      }
                    }}
                    className={`group/item relative h-36 sm:h-40 rounded-2xl overflow-hidden border transition-all duration-300 flex items-end p-3 cursor-pointer ${
                      isSelected
                        ? 'border-black ring-2 ring-black/50 shadow-xl'
                        : 'border-gray-200 hover:border-gray-400 hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={catName}
                      className="absolute inset-0 w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700 ease-out opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="relative z-10 w-full flex items-center justify-between">
                      <span className="block text-xs font-bold text-white tracking-widest uppercase truncate">
                        {catName}
                      </span>
                      {subsDeEstaCat.length > 0 && (
                        <ChevronDown
                          size={14}
                          className={`text-white shrink-0 transition-transform duration-300 ${
                            isSelected ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => scroll('right')}
            aria-label="Siguiente"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/80 text-white hover:bg-black p-2 rounded-full border border-white/20 shadow-lg backdrop-blur-sm translate-x-2 sm:translate-x-0 transition-all duration-300 active:scale-90"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Subcategorías de la Categoría Activa */}
        {openCategory && activeSubcategories.length > 0 && (
          <FadeIn delay={50}>
            <div className="mt-6 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-widest text-gray-400 uppercase font-bold">
                  Subcategorías de <span className="text-white">{openCategory}</span>
                </p>
                <button 
                  onClick={() => setOpenCategory(null)}
                  className="text-xs text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Cerrar ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {activeSubcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/?category=${encodeURIComponent(openCategory)}&subcategory=${encodeURIComponent(sub.nombre)}#seleccion`}
                    className="text-center text-xs font-bold uppercase tracking-wider text-white bg-black border border-zinc-700 hover:border-white hover:bg-zinc-800 py-3 px-4 rounded-xl transition-all duration-300 shadow-sm truncate block"
                  >
                    {sub.nombre}
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </section>

      {/* Grid de Productos */}
      <section id="seleccion" className="max-w-7xl mx-auto py-4 pb-20 px-4 sm:px-6">
        <ProductGrid hideCategoryBar={true} />
      </section>

      {/* Sección de Preguntas Frecuentes (FAQ) */}
      {!loadingFaqs && faqs.length > 0 && (
        <section id="faqs" className="max-w-4xl mx-auto py-16 px-4 sm:px-6 border-t border-gray-200 scroll-mt-24">
          <FadeIn>
            <div className="text-center mb-10 space-y-2">
              <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase font-bold">Resolvé tus dudas</p>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">
                Preguntas Frecuentes
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === faq.id;
              return (
                <FadeIn key={faq.id} delay={index * 50}>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:border-gray-400 hover:shadow-md">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none"
                    >
                      <span className="text-sm sm:text-base font-semibold text-gray-900">
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-700 shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 whitespace-pre-wrap animate-fade-in">
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