import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { MessageCircle, ShoppingCart, ArrowLeft, Sparkles, Check, Heart, Share2 } from 'lucide-react';
import { siteConfig } from '../config/site';
import { useWishlist } from '../hooks/useWishlist';
import FadeIn from './FadeIn';

const STOCK_BAJO_UMBRAL = 5;

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
  const [agregarCaja, setAgregarCaja] = useState(false);
  const [cajaPresentacion, setCajaPresentacion] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [relacionados, setRelacionados] = useState([]);
  const [copiado, setCopiado] = useState(false);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();
      if (!error) {
        setProduct(data);
        setSelectedImage(data.image_url);
        fetchRelacionados(data);
      }
    }
    async function fetchCaja() {
      const { data } = await supabase
        .from('productos')
        .select('*')
        .ilike('name', '%Caja de Presentación%')
        .limit(1)
        .maybeSingle();
      if (data) setCajaPresentacion(data);
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
    fetchCaja();
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
  const sinStock = (product.stock ?? 0) === 0;
  const stockBajo = !sinStock && (product.stock ?? 0) < STOCK_BAJO_UMBRAL;

  function handleAgregarCarrito() {
    addToCart(product);
    if (agregarCaja && cajaPresentacion) addToCart(cajaPresentacion);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }

  async function handleCompartir() {
    const shareUrl = window.location.href;
    const shareData = {
      title: product.name,
      text: `Mirá ${product.name} en ${siteConfig.businessName}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // el usuario canceló el share, no hacemos nada
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      } catch (err) {
        console.error('No se pudo copiar el link', err);
      }
    }
  }

  const extraImages = Array.isArray(product.image_urls) ? product.image_urls : [];
  const gallery = [product.image_url, ...extraImages].filter((url, i, arr) => url && arr.indexOf(url) === i);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12 relative">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <Link to="/" className="group inline-flex items-center gap-2 text-bib-gray hover:text-bib-white transition-colors text-xs sm:text-sm uppercase tracking-widest">
          <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" /> Volver a la selección
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
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
                    <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 sm:gap-8">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-bib-white mb-3 sm:mb-4 break-words tracking-tight">{product.name}</h1>
              <p className="text-xl sm:text-2xl md:text-3xl font-medium text-bib-red tracking-tight mb-3 sm:mb-4">${product.price.toLocaleString('es-AR')}</p>

              {stockBajo && (
                <p className="text-yellow-400 text-xs sm:text-sm font-medium uppercase tracking-wide mb-3 sm:mb-4">
                  ¡Últimas {product.stock} unidades!
                </p>
              )}

              {cajaPresentacion && (
                <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-bib-gray cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={agregarCaja}
                    onChange={(e) => setAgregarCaja(e.target.checked)}
                    className="w-4 h-4 accent-bib-red cursor-pointer"
                  />
                  Agregar {cajaPresentacion.name} + ${Number(cajaPresentacion.price).toLocaleString('es-AR')}
                </label>
              )}
            </div>

            <div className="border-y border-bib-white/10 py-6 sm:py-8">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-bib-gray mb-3 sm:mb-4 font-medium">Sobre este producto</h4>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-bib-white/80">
                {product.description || `Cada producto de ${siteConfig.businessName} está pensado para que se note tu onda a la hora de cebar. Si tenés dudas sobre materiales o stock, escribinos.`}
              </p>
            </div>

            {esPersonalizable && (
              <div className="flex gap-3 bg-bib-red/10 border border-bib-red/30 rounded p-4 sm:p-5">
                <Sparkles size={20} className="text-bib-red shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-bib-white/80 leading-relaxed">
                  <span className="text-bib-red font-medium uppercase tracking-wide">¿Lo querés personalizado o grabado?</span><br />
                  Una vez realizada la compra te contactamos por WhatsApp para definir el diseño. Demora de 2 a 5 días hábiles.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:gap-4">
              <button
                onClick={handleAgregarCarrito}
                disabled={sinStock}
                className={`group flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg py-4 sm:py-5 rounded font-bold transition-all active:scale-[0.98] uppercase tracking-widest ${
                  sinStock
                    ? 'bg-bib-white/10 text-bib-white/30 cursor-not-allowed'
                    : 'bg-bib-red text-bib-black hover:bg-bib-white hover:shadow-[0_0_25px_rgba(196,162,120,0.3)]'
                }`}
              >
                <ShoppingCart size={18} className="group-hover:-translate-y-1 transition-transform shrink-0" />
                {sinStock ? 'Sin stock' : 'Agregar al carrito'}
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-bib-white truncate">{p.name}</p>
                    <p className="text-sm sm:text-base font-medium text-bib-red mt-1">${Number(p.price).toLocaleString('es-AR')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-bib-red text-bib-black px-5 py-3 rounded-full font-bold text-sm shadow-lg transition-all duration-300 ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <Check size={16} strokeWidth={3} />
        Agregado al carrito
      </div>

      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bib-black/95 backdrop-blur-md border-t border-bib-white/10 p-3 flex items-center gap-3 transition-transform duration-300 ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-bib-white text-sm font-medium truncate">{product.name}</p>
          <p className="text-bib-red font-bold">${product.price.toLocaleString('es-AR')}</p>
        </div>
        <button
          onClick={handleAgregarCarrito}
          disabled={sinStock}
          className={`flex items-center gap-2 px-5 py-3 rounded font-bold text-sm uppercase tracking-wide active:scale-95 transition-transform shrink-0 ${
            sinStock ? 'bg-bib-white/10 text-bib-white/30 cursor-not-allowed' : 'bg-bib-red text-bib-black'
          }`}
        >
          <ShoppingCart size={16} />
          {sinStock ? 'Sin stock' : 'Agregar'}
        </button>
      </div>
    </div>
  );
}