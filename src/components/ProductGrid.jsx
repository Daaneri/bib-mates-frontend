import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search, ImageOff, Heart, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../config/categories';
import { useWishlist } from '../hooks/useWishlist';

const CATEGORIAS_CON_TODOS = ['Todos', ...CATEGORIES];

function ProductCardSkeleton() {
  return (
    <div className="bg-bib-dark p-2.5 sm:p-4 rounded border border-bib-white/10 flex flex-col animate-pulse">
      <div className="aspect-square bg-bib-card rounded mb-2 sm:mb-3" />
      <div className="h-3 bg-bib-card rounded w-3/4 mb-1.5" />
      <div className="h-4 bg-bib-card rounded w-1/2 mb-1.5" />
      <div className="h-3 bg-bib-card rounded w-2/3 mb-3" />
      <div className="h-8 bg-bib-card rounded mt-auto" />
    </div>
  );
}

function ProductCard({ product, mostrarStockBajo, umbralStockBajo }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const sinStock = (product.stock ?? 0) === 0;
  const stockBajo = mostrarStockBajo && !sinStock && (product.stock ?? 0) < umbralStockBajo;

  const precioLista = product.price || 0;
  const cuotaMonto = precioLista / 3;
  const precioTransferencia = product.price_cash ? product.price_cash : precioLista * 0.80;

  return (
    <div className="group bg-bib-dark p-2 sm:p-4 rounded border border-bib-white/10 transition-all duration-300 hover:border-[#C4A278]/50 flex flex-col justify-between relative h-full">
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 bg-bib-black/70 backdrop-blur-sm p-1.5 rounded-full text-bib-white hover:scale-110 transition-transform"
        aria-label={isWishlisted(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart size={13} className={isWishlisted(product.id) ? 'fill-[#C4A278] text-[#C4A278]' : ''} />
      </button>

      <div>
        <Link to={`/producto/${product.id}`} className="block aspect-square bg-bib-card rounded overflow-hidden mb-2 sm:mb-3 relative">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 h-full text-bib-white/20">
              <ImageOff size={20} strokeWidth={1.25} />
              <span className="uppercase tracking-widest text-[8px] sm:text-[10px]">Sin imagen</span>
            </div>
          )}
          {sinStock && (
            <span className="absolute bottom-1.5 left-1.5 bg-bib-black/90 border border-bib-white/20 text-bib-white/80 text-[8px] sm:text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded z-10">
              Sin stock
            </span>
          )}
          {stockBajo && (
            <span className="absolute bottom-1.5 left-1.5 bg-yellow-500/90 text-black text-[8px] sm:text-[10px] font-medium uppercase tracking-widest px-1.5 py-0.5 rounded z-10">
              ¡Últimas {product.stock}!
            </span>
          )}
        </Link>
        <div className="space-y-1 mb-3">
          <Link to={`/producto/${product.id}`} className="block">
            <h3 className="text-[11px] sm:text-sm font-medium text-bib-white line-clamp-1 hover:text-[#C4A278] transition-colors">
              {product.name}
            </h3>
          </Link>
          <div>
            <p className="text-base sm:text-lg font-bold text-bib-white tracking-tight">
              ${Math.round(precioLista).toLocaleString('es-AR')}
            </p>
          </div>
          <p className="text-[10px] sm:text-xs text-[#C4A278] font-medium leading-tight">
            3 cuotas sin interés de <span className="font-bold">${Math.round(cuotaMonto).toLocaleString('es-AR')}</span>
          </p>
          <p className="text-[10px] sm:text-xs text-emerald-400 font-medium leading-tight pt-0.5">
            <span className="bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20 text-[9px] font-bold mr-1">20% OFF</span>
            ${Math.round(precioTransferencia).toLocaleString('es-AR')} abonando con transferencia
          </p>
        </div>
      </div>
      <Link to={`/producto/${product.id}`} className="block w-full mt-auto">
        <button
          disabled={sinStock}
          className={`w-full py-2 sm:py-2.5 rounded font-semibold text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest transition-all duration-200 ${
            sinStock
              ? 'bg-bib-white/10 text-bib-white/30 cursor-not-allowed border border-bib-white/10'
              : 'bg-[#C4A278] hover:bg-bib-white text-bib-black'
          }`}
        >
          {sinStock ? 'Sin stock' : 'Comprar'}
        </button>
      </Link>
    </div>
  );
}

export default function ProductGrid({ hideCategoryBar = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('default');
  
  const urlCategory = searchParams.get('category') || 'Todos';
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [precioAbierto, setPrecioAbierto] = useState(false);
  const precioRef = useRef(null);
  const [mostrarStockBajo, setMostrarStockBajo] = useState(true);
  const [umbralStockBajo, setUmbralStockBajo] = useState(5);

  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) {
      setSelectedCategory(catFromUrl);
    }
    const subFromUrl = searchParams.get('subcategory');
    if (subFromUrl !== null) {
      setSelectedSubcategory(subFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [productsRes, subRes, settingsRes] = await Promise.all([
        supabase.from('productos').select('*'),
        supabase.from('subcategorias').select('*'),
        supabase.from('site_settings').select('mostrar_stock_bajo, umbral_stock_bajo').eq('id', 1).single()
      ]);

      setProducts(productsRes.data || []);
      setAllSubcategories(subRes.data || []);

      if (settingsRes.data) {
        setMostrarStockBajo(settingsRes.data.mostrar_stock_bajo ?? true);
        setUmbralStockBajo(settingsRes.data.umbral_stock_bajo ?? 5);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const normalizeText = (str) => 
    (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Filtro flexible que extrae las subcategorías haciendo coincidir los nombres sin importar mayúsculas o acentos
  const subcategoriasDisponibles = selectedCategory.toLowerCase() === 'todos' 
    ? [] 
    : allSubcategories
        .filter(item => {
          const itemCat = normalizeText(item.categoria_nombre || item.categoria);
          const currentCat = normalizeText(selectedCategory);
          return itemCat === currentCat;
        })
        .map(item => item.nombre)
        .filter((val, index, self) => self.indexOf(val) === index);

  useEffect(() => {
    function handleClickOutside(event) {
      if (precioRef.current && !precioRef.current.contains(event.target)) {
        setPrecioAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products
    .filter(p => p.archivado !== true)
    .filter(p => {
      const productCat = (p.category || 'Otros').toLowerCase();
      const matchesCategory = selectedCategory.toLowerCase() === 'todos' || productCat === selectedCategory.toLowerCase();
      const matchesSubcategory = !selectedSubcategory || (p.subcategory || '').toLowerCase() === selectedSubcategory.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMinPrice = !minPrice || p.price >= Number(minPrice);
      const matchesMaxPrice = !maxPrice || p.price <= Number(maxPrice);

      return matchesCategory && matchesSubcategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
      return 0;
    });

  return (
    <div id="seleccion" className="px-1.5 sm:px-6 space-y-4 sm:space-y-8 pb-28 sm:pb-12">
      <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">
        {!hideCategoryBar && (
          <>
            {/* BOTONES DE CATEGORÍAS PRINCIPALES */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible scrollbar-hide">
              {CATEGORIAS_CON_TODOS.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSubcategory('');
                    setSearchParams({ category: cat });
                  }}
                  className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded text-[11px] sm:text-sm tracking-wide uppercase transition-all border shrink-0 whitespace-nowrap ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-[#C4A278] text-bib-black font-semibold border-[#C4A278]'
                      : 'bg-bib-dark text-bib-white border-bib-white/10 hover:border-bib-white/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* BARRA DE SUBCATEGORÍAS DINÁMICAS */}
            {selectedCategory.toLowerCase() !== 'todos' && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-2.5 px-4 bg-bib-dark/95 border border-[#C4A278]/40 rounded-lg shadow-lg animate-fadeIn scrollbar-hide">
                <span className="text-[10px] sm:text-xs text-[#C4A278] uppercase tracking-widest font-bold mr-2">
                  Filtrar {selectedCategory}:
                </span>
                
                <button
                  onClick={() => {
                    setSelectedSubcategory('');
                    setSearchParams({ category: selectedCategory });
                  }}
                  className={`px-3 py-1 rounded text-[10px] sm:text-xs tracking-wide uppercase transition-all border shrink-0 whitespace-nowrap ${
                    selectedSubcategory === ''
                      ? 'bg-[#C4A278] text-bib-black font-semibold border-[#C4A278]'
                      : 'bg-transparent text-bib-white/70 border-bib-white/10 hover:border-bib-white/30'
                  }`}
                >
                  Todas
                </button>

                {subcategoriasDisponibles.map(sub => (
                  <button
                    key={sub}
                    onClick={() => {
                      setSelectedSubcategory(sub);
                      setSearchParams({ category: selectedCategory, subcategory: sub });
                    }}
                    className={`px-3 py-1 rounded text-[10px] sm:text-xs tracking-wide uppercase transition-all border shrink-0 whitespace-nowrap ${
                      selectedSubcategory.toLowerCase() === sub.toLowerCase()
                        ? 'bg-[#C4A278] text-bib-black font-semibold border-[#C4A278]'
                        : 'bg-transparent text-bib-white/70 border-bib-white/10 hover:border-bib-white/30'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Barra de Búsqueda y Ordenamiento */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between pt-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-bib-white/40">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-bib-dark border border-bib-white/10 rounded pl-9 pr-4 py-2 text-xs sm:text-sm text-bib-white placeholder-bib-white/30 focus:outline-none focus:border-[#C4A278] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-bib-white/40 hover:text-bib-white"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative" ref={precioRef}>
              <button
                onClick={() => setPrecioAbierto(!precioAbierto)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded text-xs sm:text-sm border transition-all ${
                  minPrice || maxPrice
                    ? 'bg-[#C4A278] text-bib-black border-[#C4A278] font-medium'
                    : 'bg-bib-dark text-bib-white border-bib-white/10 hover:border-bib-white/30'
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>Precio</span>
                <ChevronDown size={14} className={`transition-transform ${precioAbierto ? 'rotate-180' : ''}`} />
              </button>

              {precioAbierto && (
                <div className="absolute right-0 mt-2 w-64 bg-bib-dark border border-bib-white/10 rounded-lg shadow-2xl p-4 z-30 space-y-3">
                  <div className="text-xs font-medium text-bib-white uppercase tracking-wider">Filtrar por precio</div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-bib-white/60 uppercase">Mínimo</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        placeholder="$ 0"
                        className="w-full bg-bib-card border border-bib-white/10 rounded px-2.5 py-1.5 text-xs text-bib-white focus:outline-none focus:border-[#C4A278]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-bib-white/60 uppercase">Máximo</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        placeholder="$ Sin límite"
                        className="w-full bg-bib-card border border-bib-white/10 rounded px-2.5 py-1.5 text-xs text-bib-white focus:outline-none focus:border-[#C4A278]"
                      />
                    </div>
                  </div>
                  {(minPrice || maxPrice) && (
                    <button
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                      }}
                      className="w-full text-center text-xs text-[#C4A278] hover:underline pt-1"
                    >
                      Limpiar filtros de precio
                    </button>
                  )}
                </div>
              )}
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none bg-bib-dark border border-bib-white/10 rounded px-3 py-2 text-xs sm:text-sm text-bib-white focus:outline-none focus:border-[#C4A278] transition-colors cursor-pointer"
            >
              <option value="default" className="bg-bib-dark text-bib-white">Ordenar por</option>
              <option value="newest" className="bg-bib-dark text-bib-white">Más recientes</option>
              <option value="price-low" className="bg-bib-dark text-bib-white">Menor precio</option>
              <option value="price-high" className="bg-bib-dark text-bib-white">Mayor precio</option>
              <option value="name-asc" className="bg-bib-dark text-bib-white">A - Z</option>
              <option value="name-desc" className="bg-bib-dark text-bib-white">Z - A</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 max-w-7xl mx-auto">
          {filteredProducts.map(p => (
            <ProductCard key={p.id} product={p} mostrarStockBajo={mostrarStockBajo} umbralStockBajo={umbralStockBajo} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3">
          <div className="text-bib-white/20 flex justify-center"><Search size={40} strokeWidth={1} /></div>
          <p className="text-bib-white/60 text-sm">No se encontraron productos que coincidan con tu búsqueda.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Todos');
              setSelectedSubcategory('');
              setMinPrice('');
              setMaxPrice('');
            }}
            className="text-xs text-[#C4A278] underline hover:text-bib-white transition-colors"
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}
    </div>
  );
}