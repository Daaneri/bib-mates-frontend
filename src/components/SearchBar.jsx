import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search, X, Loader2 } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda con Debounce en Supabase
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select('id, name, price, price_cash, image_url, category')
        .filter('archivado', 'neq', true)
        .ilike('name', `%${query}%`)
        .limit(5);

      if (!error && data) {
        setResults(data);
        setIsOpen(true);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectProduct = (id) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/producto/${id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          placeholder="Buscar mates, termos, accesorios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          className="w-full bg-bib-black border border-bib-white/20 text-bib-white py-2.5 pl-10 pr-8 rounded outline-none focus:border-[#C4A278] transition-colors text-xs sm:text-sm placeholder:text-bib-white/40"
        />
        <Search className="absolute left-3 text-bib-white/50" size={16} />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 text-bib-white/40 hover:text-bib-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {/* Menú Desplegable con Resultados */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bib-dark border border-bib-white/10 rounded-lg shadow-2xl overflow-hidden z-50 divide-y divide-bib-white/5">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-bib-gray gap-2 text-xs">
              <Loader2 size={16} className="animate-spin text-[#C4A278]" />
              Buscando productos...
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((product) => {
                const precioPromocional = product.price_cash || product.price * 0.8;
                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.id)}
                    className="flex items-center gap-3 p-2.5 sm:p-3 hover:bg-bib-white/5 cursor-pointer transition-colors"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded border border-bib-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-bib-white truncate">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-bib-gray uppercase tracking-wider">
                        {product.category || 'General'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-bold text-bib-white">
                        ${Math.round(product.price).toLocaleString('es-AR')}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-medium">
                        ${Math.round(precioPromocional).toLocaleString('es-AR')} transf.
                      </p>
                    </div>
                  </div>
                );
              })}
              
              <button
                onClick={handleSearchSubmit}
                className="w-full py-2.5 text-center text-xs text-[#C4A278] hover:bg-[#C4A278]/10 font-medium uppercase tracking-wider transition-colors"
              >
                Ver todos los resultados para "{query}"
              </button>
            </>
          ) : (
            <div className="p-4 text-center text-xs text-bib-gray">
              No se encontraron productos que coincidan con "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}