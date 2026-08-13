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
      <div className="h-4 w-40 rounded bg-bib-white/10 animate-pulse mb-6 sm:mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16 items-start bg-bib-dark p-5 sm:p-8 md:p-12 rounded border border-bib-white/10">
        <div className="space-y-3 sm:space-y-4">
          <div className="aspect-square rounded bg-bib-card animate-pulse" />
          <div className="flex gap-2 sm:gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded bg-bib-card animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6 sm:gap-8">
          <div>
            <div className="h-8 sm:h-10 w-3/4 rounded bg-bib-white/10 animate-pulse mb-4" />
            <div className="h-6 w-1/3 rounded bg-bib-white/10 animate-pulse" />
          </div>
          <div className="border-y border-bib-white/10 py-6 sm:py-8 space-y-2">
            <div className="h-3 w-full rounded bg-bib-white/10 animate-pulse" />
            <div className="h-3 w-full rounded bg-bib-white/10 animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-bib-white/10 animate-pulse" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="h-14 sm:h-16 rounded bg-bib-white/10 animate-pulse" />
            <div className="h-14 sm:h-16 rounded bg-bib-white/5 animate-pulse" />
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
      itemBase.id = `${product.id}-${varianteSeleccionada.color}`; // id distinto por color, para que el carrito no mezcle colores distintos en una sola línea
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
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] sm:text-xs text-bib-gray overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-bib-white transition-colors shrink-0">Inicio</Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link to={`/?category=${encodeURIComponent(product.category)}#seleccion`} className="hover:text-bib-white transition-colors shrink-0">
            {product.category}
          </Link>
          {product.subcategory && (
            <>
              <ChevronRight size={12} className="shrink-0" />
              <Link to={`/?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}#seleccion`} className="hover:text-bib-white transition-colors shrink-0">
                {product.subcategory}
              </Link>
            </>
          )}
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-bib-white truncate max-w-[140px] sm:max-w-none">{product.name}</span>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleCompartir}
            className="relative text-bib-gray hover:text-bib-white transition-colors p-1.5"
            aria-label="Compartir producto"
          >
            <Share2 size={18} />
            {copiado && (
              <span className="absolute -bottom-8 right-0 bg-bib-white text-bib-black text-[10px] px-2 py-1 rounded whitespace-nowrap">
                ¡Link copiado!
              </span>
            )}
          </button>
          <button
            onClick={() => toggleWishlist(product.id)}
            className="text-bib-gray hover:text-bib-red transition-colors p-1.5"
            aria-label={isWishlisted(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={18} className={isWishlisted(product.id) ? 'fill-bib-red text-bib-red' : ''} />
          </button>
        </div>
      </div>

      <FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16 items-start bg-bib-dark p-5 sm:p-8 md:p-12 rounded border border-bib-white/10">

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-bib-card p-2 rounded border border-bib-white/10 overflow-hidden">
              <img
                key={selectedImage}
                src={selectedImage || product.image_url}
                alt={product.name}
                fetchpriority="high"
                decoding="async"
                className="w-full rounded aspect-square object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
                {gallery.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(url)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === url
                        ? 'border-bib-red scale-105'
                        : 'border-bib-white/15 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`${product.name} ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 sm:gap-8">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-bib-white mb-3 sm:mb-4 break-words tracking-tight">{product.name}</h1>
              
              {/* BLOQUE DE PRECIOS Y FINANCIACIÓN */}
              <div className="space-y-2 mb-5">
                {product.descuento_porcentaje > 0 ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-lg sm:text-xl text-bib-gray line-through">${product.price.toLocaleString('es-AR')}</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-bib-white tracking-tight">${precioLista.toLocaleString('es-AR')}</p>
                    <span className="px-2 py-1 rounded text-[10px] border border-green-700/40 bg-green-900/40 text-green-300 uppercase tracking-wide">{product.descuento_porcentaje}% OFF</span>
                  </div>
                ) : (
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-bib-white tracking-tight">${precioLista.toLocaleString('es-AR')}</p>
                )}

                {/* Cartel 3 Cuotas sin interés */}
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium pt-1">
                  <CreditCard size={18} />
                  <span>Hasta <strong>3 cuotas sin interés</strong> de <strong>${cuotaSinInteres.toLocaleString('es-AR')}</strong></span>
                </div>

                {/* Cartel Descuento por Transferencia (si price_cash existe) */}
                {product.price_cash && (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium pt-0.5">
                    <Banknote size={18} />
                    <span><strong>${product.price_cash.toLocaleString('es-AR')}</strong> pagando con Transferencia</span>
                  </div>
                )}
              </div>
            </div>

            {variantes.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm text-bib-white mb-2">
                  Elegí el color
                  {varianteSeleccionada && (
                    <span className="text-bib-gray"> — {varianteSeleccionada.color}</span>
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
                        className={`flex items-center gap-2 rounded border px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                          sinStock
                            ? 'border-bib-white/10 text-bib-white/30 cursor-not-allowed line-through'
                            : seleccionado
                            ? 'border-bib-red bg-bib-red/10 text-bib-white'
                            : 'border-bib-white/20 text-bib-gray hover:border-bib-white/40'
                        }`}
                      >
                        {v.image_url && (
                          <span className="w-5 h-5 rounded-full overflow-hidden border border-bib-white/20 shrink-0">
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

            <div className="border-y border-bib-white/10 py-6 sm:py-8">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-bib-gray mb-3 sm:mb-4 font-medium">Sobre este producto</h4>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-bib-white/80">
                {product.description || `Cada producto de ${siteConfig.businessName} está pensado para que se note tu onda a la hora de cebar. Si tenés dudas sobre materiales o stock, escribinos.`}
              </p>
            </div>

            <div className="space-y-4">
              {esPersonalizable && (
                <div>
                  <p className="text-xs sm:text-sm text-bib-white mb-2">
                    ¿Querés que tu mate venga grabado? <span className="text-bib-red">(+${PRECIO_GRABADO.toLocaleString('es-AR')})</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuiereGrabado(true)}
                      className={`rounded border px-4 py-2.5 text-xs sm:text-sm font-medium uppercase tracking-wide transition-colors ${
                        quiereGrabado ? 'border-bib-red bg-bib-red/10 text-bib-white' : 'border-bib-white/20 text-bib-gray'
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuiereGrabado(false)}
                      className={`rounded border px-4 py-2.5 text-xs sm:text-sm font-medium uppercase tracking-wide transition-colors ${
                        !quiereGrabado ? 'border-bib-red bg-bib-red/10 text-bib-white' : 'border-bib-white/20 text-bib-gray'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs sm:text-sm text-bib-white mb-2">
                  ¿Querés agregar caja de presentación? <span className="text-bib-red">(+${PRECIO_CAJA.toLocaleString('es-AR')})</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuiereCaja(true)}
                    className={`rounded border px-4 py-2.5 text-xs sm:text-sm font-medium uppercase tracking-wide transition-colors ${
                      quiereCaja ? 'border-bib-red bg-bib-red/10 text-bib-white' : 'border-bib-white/20 text-bib-gray'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuiereCaja(false)}
                    className={`rounded border px-4 py-2.5 text-xs sm:text-sm font-medium uppercase tracking-wide transition-colors ${
                      !quiereCaja ? 'border-bib-red bg-bib-red/10 text-bib-white' : 'border-bib-white/20 text-bib-gray'
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
                className="group flex items-center justify-center gap-2 sm:gap-3 bg-bib-red text-bib-black text-sm sm:text-base md:text-lg py-4 sm:py-5 rounded font-bold hover:bg-bib-white transition-all active:scale-[0.98] uppercase tracking-widest hover:shadow-[0_0_25px_rgba(196,162,120,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <ShoppingCart size={18} className="group-hover:-translate-y-1 transition-transform shrink-0" />
                Agregar al carrito
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 sm:gap-3 border border-bib-white/20 text-bib-white text-sm sm:text-base md:text-lg py-4 sm:py-5 rounded font-medium hover:bg-bib-white/10 transition-all active:scale-[0.98] uppercase tracking-widest"
              >
                <MessageCircle size={18} className="shrink-0" />
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </FadeIn>

      {relacionados.length > 0 && (
        <FadeIn delay={150}>
          <div className="mt-12 sm:mt-16 md:mt-20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-bib-white mb-6 sm:mb-8 tracking-tight lowercase">también te puede interesar</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {relacionados.map((p) => (
                <Link
                  key={p.id}
                  to={`/producto/${p.id}`}
                  className="group bg-bib-dark rounded border border-bib-white/10 overflow-hidden hover:border-bib-red/40 hover:-translate-y-1 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.7)] transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden bg-bib-card">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-bib-white truncate">{p.name}</p>
                    {p.descuento_porcentaje > 0 ? (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] sm:text-xs text-bib-gray line-through">${Number(p.price).toLocaleString('es-AR')}</p>
                        <p className="text-sm sm:text-base font-medium text-bib-red">${precioFinal(p).toLocaleString('es-AR')}</p>
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base font-medium text-bib-red mt-1">${Number(p.price).toLocaleString('es-AR')}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bib-black/95 backdrop-blur-md border-t border-bib-white/10 p-3 flex items-center gap-3 transition-transform duration-300 ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-bib-white text-sm font-medium truncate">{product.name}</p>
          <p className="text-bib-red font-bold">${precioLista.toLocaleString('es-AR')}</p>
        </div>
        <button
          onClick={handleAgregarCarrito}
          disabled={variantes.length > 0 && (!varianteSeleccionada || varianteSeleccionada.stock <= 0)}
          className="flex items-center gap-2 bg-bib-red text-bib-black px-5 py-3 rounded font-bold text-sm uppercase tracking-wide active:scale-95 transition-transform shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
          Agregar
        </button>
      </div>
    </div>
  );
}