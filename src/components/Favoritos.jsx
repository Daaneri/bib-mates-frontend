import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ImageOff } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import FadeIn from './FadeIn';
import SeoHead from './SeoHead';

export default function Favoritos() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const { wishlist, toggleWishlist } = useWishlist();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavoritos() {
      if (!wishlist || wishlist.length === 0) {
        setProductos([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/productos/favoritos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: wishlist })
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener favoritos del servidor');
        }

        const data = await response.json();
        setProductos(data || []);
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFavoritos();
  }, [wishlist]);

  if (loading) {
    return <div className="min-h-[40vh]" />;
  }

  if (productos.length === 0) {
    return (
      <FadeIn>
        <SeoHead title="Favoritos" path="/favoritos" noindex />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 gap-4">
          <div className="w-16 h-16 rounded-full border border-dashed border-bib-white/15 flex items-center justify-center">
            <Heart size={26} className="text-bib-white/25" strokeWidth={1.25} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-bib-white lowercase">sin favoritos todavía</h1>
          <p className="text-bib-gray text-sm max-w-[240px] -mt-2">Guardá los productos que te gusten tocando el corazón en cada ficha.</p>
          <Link to="/" className="text-bib-red hover:text-bib-white underline uppercase text-sm tracking-widest transition-colors mt-2">Explorar catálogo</Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      <SeoHead title="Favoritos" path="/favoritos" noindex />
      <h1 className="text-3xl sm:text-4xl font-heading font-bold text-bib-white mb-10 text-center lowercase">tus favoritos</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
        {productos.map((p) => (
          <div key={p.id} className="group bg-bib-dark p-3 sm:p-4 md:p-6 rounded md:rounded-md border border-bib-white/10 flex flex-col relative">
            <button
              onClick={() => toggleWishlist(p.id)}
              className="absolute top-3 right-3 z-10 bg-bib-black/70 backdrop-blur-sm p-1.5 rounded-full text-bib-red hover:scale-110 transition-transform"
              aria-label="Quitar de favoritos"
            >
              <Heart size={16} className="fill-bib-red" />
            </button>
            <div className="aspect-[4/5] bg-bib-card rounded overflow-hidden mb-3 sm:mb-4 md:mb-6 relative">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 h-full text-bib-white/20">
                  <ImageOff size={28} strokeWidth={1.25} />
                </div>
              )}
            </div>
            <h3 className="text-xs sm:text-sm md:text-lg font-medium text-bib-white mb-1 truncate">{p.name}</h3>
            <p className="text-xs sm:text-sm md:text-lg font-medium text-bib-red mb-3 sm:mb-4">${p.price.toLocaleString('es-AR')}</p>
            <Link to={`/producto/${p.id}`} className="block">
              <button className="w-full border border-bib-white/20 py-2 md:py-4 rounded font-medium text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest text-bib-white hover:bg-bib-red hover:border-bib-red transition-all duration-300">
                Ver detalle
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}