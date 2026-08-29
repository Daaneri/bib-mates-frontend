import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { MessageCircle, ShoppingCart, ArrowLeft, Heart, Share2, ChevronRight, CreditCard, Banknote } from 'lucide-react';
import { siteConfig } from '../config/site';
import FadeIn from './FadeIn';
import SeoHead from './SeoHead';

const PRECIO_GRABADO = 9000;
const PRECIO_CAJA = 8500;

function precioFinal(product) {
  if (product.descuento_porcentaje > 0) {
    return Math.round(product.price * (1 - product.descuento_porcentaje / 100));
  }
  return product.price;
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12">
      <div className="h-4 w-40 rounded-xl bg-gray-100 animate-pulse mb-6 sm:mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16 items-start bg-white p-5 sm:p-8 md:p-12 rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.06)]">
        <div className="space-y-3 sm:space-y-4">
          <div className="aspect-square rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />
          <div className="flex gap-2 sm:gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 animate-pulse border border-gray-100" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6 sm:gap-8">
          <div>
            <div className="h-8 sm:h-10 w-3/4 rounded-xl bg-gray-100 animate-pulse mb-4" />
            <div className="h-6 w-1/3 rounded-xl bg-gray-100 animate-pulse" />
          </div>
          <div className="border-y border-gray-100 py-6 sm:py-8 space-y-2">
            <div className="h-3 w-full rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-3 w-full rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-3 w-2/3 rounded-xl bg-gray-100 animate-pulse" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="h-14 sm:h-16 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="h-14 sm:h-16 rounded-2xl bg-gray-50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [quiereGrabado, setQuiereGrabado] = useState(false);
  const [quiereCaja, setQuiereCaja] = useState(false);
  const [variantes, setVariantes] = useState([]);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [copiado, setCopiado] = useState(false);
  const [heartPulse, setHeartPulse] = useState(false);
  const { addToCart, openDrawer } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    async function fetchVariantes(productId) {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('producto_id', productId)
        .order('orden', { ascending: true });
      if (!error && data && data.length > 0) {
        setVariantes(data);
        const primeraConStock = data.find((v) => v.stock > 0) || data[0];
        setVarianteSeleccionada(primeraConStock);
        if (primeraConStock.image_url) setSelectedImage(primeraConStock.image_url);
      } else {
        setVariantes([]);
        setVarianteSeleccionada(null);
      }
    }
    async function fetchProduct() {
      const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();
      if (!error) {
        setProduct(data);
        setSelectedImage(data.image_url);
        fetchRelacionados(data);
        fetchVariantes(data.id);
      }
    }
    async function fetchRelacionados(currentProduct) {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('category', currentProduct.category)
        .neq('id', currentProduct.id)
        .neq('archivado', true)
        .limit(4);
      if (!error) setRelacionados(data || []);
    }
    fetchProduct();
  }, [id]);

  useEffect(() => {
    function handleScroll() {
      setShowStickyBar(window.scrollY > 400);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product) return <ProductDetailSkeleton />;

  const whatsappMessage = `Hola! Me interesa saber más sobre el producto: ${product.name}`;
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  const esPersonalizable = product.personalizable === true;
  const precioLista = precioFinal(product);
  const cuotaSinInteres = Math.round(precioLista / 3);

  function handleAgregarCarrito() {
    if (variantes.length > 0 && !varianteSeleccionada) return;
    if (varianteSeleccionada && varianteSeleccionada.stock <= 0) return;

    const itemBase = { ...product, price: precioLista };
    if (varianteSeleccionada) {
      itemBase.color = varianteSeleccionada.color;
      itemBase.variant_id = varianteSeleccionada.id;
      itemBase.id = `${product.id}-${varianteSeleccionada.color}`;
      if (varianteSeleccionada.image_url) itemBase.image_url = varianteSeleccionada.image_url;
    }
    addToCart(itemBase);

    if (quiereGrabado) {
      addToCart({ id: `${product.id}-grabado`, name: `Grabado - ${product.name}`, price: PRECIO_GRABADO });
    }
    if (quiereCaja) {
      addToCart({ id: `${product.id}-caja`, name: 'Caja de presentación', price: PRECIO_CAJA });
    }
    openDrawer();
  }

  async function handleCompartir() {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: shareUrl });
      } catch (err) {}
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('No se pudo copiar el link:', err);
    }
  }

  function handleToggleWishlist() {
    toggleWishlist(product.id);
    setHeartPulse(true);
    setTimeout(() => setHeartPulse(false), 300);
  }

  const extraImages = Array.isArray(product.image_urls) ? product.image_urls : [];
  const gallery = [product.image_url, ...extraImages].filter((url, i, arr) => url && arr.indexOf(url) === i);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} - ${siteConfig.businessName}`,
    image: gallery,
    brand: {
      "@type": "Brand",
      name: siteConfig.businessName,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: precioLista,
      availability: (product.stock ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `https://bib-mates-frontend.vercel.app/producto/${product.id}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://bib-mates-frontend.vercel.app/" },
      { "@type": "ListItem", position: 2, name: product.category, item: `https://bib-mates-frontend.vercel.app/?category=${encodeURIComponent(product.category)}#seleccion` },
      { "@type": "ListItem", position: 3, name: product.name, item: `https://bib-mates-frontend.vercel.app/producto/${product.id}` },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12 relative">
      <SeoHead
        title={product.name}
        description={product.description || `${product.name} en ${siteConfig.businessName}. Envíos a todo el país.`}
        image={product.image_url}
        path={`/producto/${product.id}`}
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />

      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-gray-900 transition-colors shrink-0">Inicio</Link>
          <ChevronRight size={12} className="shrink-0 text-gray-300" />
          <Link to={`/?category=${encodeURIComponent(product.category)}#seleccion`} className="hover:text-gray-900 transition-colors shrink-0">
            {product.category}
          </Link>
          {product.subcategory && (
            <>
              <ChevronRight size={12} className="shrink-0 text-gray-300" />
              <Link to={`/?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}#seleccion`} className="hover:text-gray-900 transition-colors shrink-0">
                {product.subcategory}
              </Link>
            </>
          )}
          <ChevronRight size={12} className="shrink-0 text-gray-300" />
          <span className="text-gray-900 font-semibold truncate max-w-[140px] sm:max-w-none">{product.name}</span>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleCompartir}
            className="relative text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-xl hover:bg-gray-50"
            aria-label="Compartir producto"
          >
            <Share2 size={18} />
            {copiado && (
              <span className="absolute -bottom-8 right-0 bg-gray-900 text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg">
                ¡Link copiado!
              </span>
            )}
          </button>
          <button
            onClick={handleToggleWishlist}
            className={`text-gray-500 hover:text-red-500 transition-all duration-200 p-2 rounded-xl hover:bg-gray-50 active:scale-125 ${heartPulse ? 'scale-125' : 'scale-100'}`}
            aria-label={isWishlisted(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={18} className={`transition-colors duration-200 ${isWishlisted(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      <FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16 items-start bg-white p-5 sm:p-8 md:p-12 rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.06)]">

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 overflow-hidden">
              <img
                key={selectedImage}
                src={selectedImage || product.image_url}
                alt={product.name}
                fetchpriority="high"
                decoding="async"
                className="w-full rounded-xl aspect-square object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
              />
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
                {gallery.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(url)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-700 ease-out ${
                      selectedImage === url
                        ? 'border-gray-900 scale-105 shadow-[0_4px_14px_rgb(0,0,0,0.12)]'
                        : 'border-gray-100 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`${product.name} ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 ease-out" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 sm:gap-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 break-words tracking-tight">{product.name}</h1>

              <div className="space-y-2 mb-5">
                {product.descuento_porcentaje > 0 ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-base sm:text-lg text-gray-400 line-through">${product.price.toLocaleString('es-AR')}</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">${precioLista.toLocaleString('es-AR')}</p>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-widest">{product.descuento_porcentaje}% OFF</span>
                  </div>
                ) : (
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">${precioLista.toLocaleString('es-AR')}</p>
                )}

                <div className="flex items-center gap-2 text-sky-600 text-xs sm:text-sm font-medium pt-1">
                  <CreditCard size={18} />
                  <span>Hasta <strong>3 cuotas sin interés</strong> de <strong>${cuotaSinInteres.toLocaleString('es-AR')}</strong></span>
                </div>

                {product.price_cash && (
                  <div className="flex items-center gap-2 text-emerald-700 text-xs sm:text-sm font-medium pt-0.5">
                    <Banknote size={18} />
                    <span><strong>${product.price_cash.toLocaleString('es-AR')}</strong> pagando con Transferencia</span>
                  </div>
                )}
              </div>
            </div>

            {variantes.length > 0 && (
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-widest">
                  Elegí el color
                  {varianteSeleccionada && (
                    <span className="text-gray-400 font-medium normal-case tracking-normal"> — {varianteSeleccionada.color}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {variantes.map((v) => {
                    const sinStock = v.stock <= 0;
                    const seleccionado = varianteSeleccionada?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={sinStock}
                        onClick={() => {
                          setVarianteSeleccionada(v);
                          if (v.image_url) setSelectedImage(v.image_url);
                        }}
                        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                          sinStock
                            ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50'
                            : seleccionado
                            ? 'border-gray-900 bg-gray-900 text-white shadow-[0_4px_14px_rgb(0,0,0,0.15)] scale-[1.03]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white hover:scale-[1.02]'
                        }`}
                      >
                        {v.image_url && (
                          <span className={`w-5 h-5 rounded-full overflow-hidden border shrink-0 transition-colors duration-300 ${seleccionado ? 'border-white/40' : 'border-gray-200'}`}>
                            <img src={v.image_url} alt={v.color} className="w-full h-full object-cover" />
                          </span>
                        )}
                        {v.color}
                        {sinStock && ' (sin stock)'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-y border-gray-100 py-6 sm:py-8">
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-2 font-bold">Sobre este producto</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
                {product.description || `Cada producto de ${siteConfig.businessName} está pensado para que se note tu onda a la hora de cebar. Si tenés dudas sobre materiales o stock, escribinos.`}
              </p>
            </div>

            <div className="space-y-4">
              {esPersonalizable && (
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-widest">
                    ¿Querés que tu mate venga grabado? <span className="text-[#C4A278] normal-case tracking-normal font-bold">(+${PRECIO_GRABADO.toLocaleString('es-AR')})</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuiereGrabado(true)}
                      className={`rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                        quiereGrabado ? 'border-gray-900 bg-gray-900 text-white shadow-[0_4px_14px_rgb(0,0,0,0.15)] scale-[1.02]' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuiereGrabado(false)}
                      className={`rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                        !quiereGrabado ? 'border-gray-900 bg-gray-900 text-white shadow-[0_4px_14px_rgb(0,0,0,0.15)] scale-[1.02]' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] sm:text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-widest">
                  ¿Querés agregar caja de presentación? <span className="text-[#C4A278] normal-case tracking-normal font-bold">(+${PRECIO_CAJA.toLocaleString('es-AR')})</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuiereCaja(true)}
                    className={`rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                      quiereCaja ? 'border-gray-900 bg-gray-900 text-white shadow-[0_4px_14px_rgb(0,0,0,0.15)] scale-[1.02]' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuiereCaja(false)}
                    className={`rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                      !quiereCaja ? 'border-gray-900 bg-gray-900 text-white shadow-[0_4px_14px_rgb(0,0,0,0.15)] scale-[1.02]' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <button
                onClick={handleAgregarCarrito}
                disabled={variantes.length > 0 && (!varianteSeleccionada || varianteSeleccionada.stock <= 0)}
                className="group flex items-center justify-center gap-2 sm:gap-3 bg-gray-900 text-white text-xs sm:text-sm py-4 sm:py-4.5 rounded-xl font-bold hover:bg-[#C4A278] hover:text-gray-900 transition-all duration-300 active:scale-[0.98] uppercase tracking-widest shadow-[0_10px_30px_rgb(0,0,0,0.12)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900 disabled:hover:text-white"
              >
                <ShoppingCart size={18} className="group-hover:-translate-y-0.5 transition-transform duration-300 shrink-0" />
                Agregar al carrito
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 sm:gap-3 border border-gray-200 text-gray-800 text-xs sm:text-sm py-4 sm:py-4.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 active:scale-[0.98] uppercase tracking-widest"
              >
                <MessageCircle size={18} className="shrink-0 text-emerald-600" />
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </FadeIn>

      {relacionados.length > 0 && (
        <FadeIn delay={150}>
          <div className="mt-12 sm:mt-16 md:mt-20">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-6 sm:mb-8 uppercase tracking-widest">También te puede interesar</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {relacionados.map((p) => (
                <Link
                  key={p.id}
                  to={`/producto/${p.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_50px_rgb(0,0,0,0.10)] transition-all duration-500 ease-out"
                >
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="p-3.5 sm:p-4">
                    <p className="text-xs font-semibold text-gray-900 truncate mb-1">{p.name}</p>
                    {p.descuento_porcentaje > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-gray-400 line-through">${Number(p.price).toLocaleString('es-AR')}</p>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-widest">
                            {p.descuento_porcentaje}% OFF
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-900">
                          ${precioFinal(p).toLocaleString('es-AR')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm font-bold text-gray-900">
                        ${Number(p.price).toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/85 border-t border-white/60 p-3.5 flex items-center gap-3 transition-transform duration-300 ease-out shadow-[0_-10px_40px_rgb(0,0,0,0.10)] ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-xs font-semibold truncate">{product.name}</p>
          <p className="text-gray-900 text-sm font-bold">${precioLista.toLocaleString('es-AR')}</p>
        </div>
        <button
          onClick={handleAgregarCarrito}
          disabled={variantes.length > 0 && (!varianteSeleccionada || varianteSeleccionada.stock <= 0)}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform duration-200 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
          Agregar
        </button>
      </div>
    </div>
  );
}