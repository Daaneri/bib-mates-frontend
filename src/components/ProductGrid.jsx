import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search, ImageOff, Heart, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { CATEGORIES, SUBCATEGORIES } from '../config/categories';
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
  const precioMercadoPago = product.price_cash 
    ? product.price_cash 
    : precioLista * 0.80;

  const cuotaMonto = (precioLista / 3).toFixed(2);

  return (
    <div className="group bg-bib-dark p-2 sm:p-4 rounded border border-bib-white/10 transition-all duration-300 hover:border-[#C4A278]/50 flex flex-col justify-between relative h-full">
      
      {/* Botón Favoritos */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 bg-bib-black/70 backdrop-blur-sm p-1.5 rounded-full text-bib-white hover:scale-110 transition-transform"
        aria-label={isWishlisted(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart size={13} className={isWishlisted(product.id) ? 'fill-[#C4A278] text-[#C4A278]' : ''} />
      </button>

      <div>
        {/* Imagen del Producto */}
        <Link to={`/producto/${product.id}`} className="block aspect-square bg-bib-card rounded overflow-hidden mb-2 sm:mb-3 relative">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
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

        {/* Información de precios adaptada a móvil */}
        <div className="space-y-1 mb-3">
          <Link to={`/producto/${product.id}`} className="block">
            <h3 className="text-[11px] sm:text-sm font-medium text-bib-white line-clamp-1 hover:text-[#C4A278] transition-colors">
              {product.name}
            </h3>
          </Link>

          <div>
            <p className="text-xs sm:text-lg font-bold text-bib-white tracking-tight">
              ${precioLista.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <p className="text-[9px] sm:text-xs text-[#C4A278] font-medium leading-tight">
            ${precioMercadoPago.toLocaleString('es-AR', { minimumFractionDigits: 2 })}{' '}
            <span className="text-[8px] sm:text-[10px] text-bib-gray font-normal block sm:inline">pagando con MP</span>
          </p>

          <p className="text-[8px] sm:text-xs text-bib-gray/80 line-clamp-1">
            3 cuotas de <span className="font-medium text-bib-white">${Number(cuotaMonto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
      </div>

      {/* Botón Comprar */}
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
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [precioAbierto, setPrecioAbierto] = useState(false);
  const precioRef = useRef(null);

  const [mostrarStockBajo, setMostrarStockBajo] = useState(true);
  const [umbralStockBajo, setUmbralStockBajo] = useState(5);

  useEffect(() => {
    function handleClickAfuera(e) {
      if (precioRef.current && !precioRef.current.contains(e.target)) {
        setPrecioAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from('productos').select('*');
      if (error) console.error("Error al traer productos:", error);
      else setProducts(data || []);
      setLoading(false);
    }
    async function fetchSettings() {
      const { data, error } = await supabase
        .from('site_settings')
        .select('mostrar_stock_bajo, umbral_stock_bajo')
        .eq('id', 1)
        .single();
      if (!error && data) {
        if (data.mostrar_stock_bajo !== null) setMostrarStockBajo(data.mostrar_stock_bajo);
        if (data.umbral_stock_bajo !== null) setUmbralStockBajo(data.umbral_stock_bajo);
      }
    }
    fetchProducts();
    fetchSettings();
  }, []);

  useEffect(() => {
    const paramCategory = searchParams.get('category');
    if (paramCategory) {
      setSelectedCategory(paramCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    const paramSearch = searchParams.get('search');
    if (paramSearch !== null) {
      setSearchTerm(paramSearch);
    }
  }, [searchParams]);

  function handleCategoryClick(cat) {
    setSelectedCategory(cat);
    setSelectedSubcategory('');
  }

  const filteredProducts = products
    .filter(p => p.archivado !== true)
    .filter(p => {
      const productCat = (p.category || 'Otros').toLowerCase();
      const matchesCategory = selectedCategory === 'Todos' || productCat === selectedCategory.toLowerCase();
      const matchesSubcategory = !selectedSubcategory || (p.subcategory || '').toLowerCase() === selectedSubcategory.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMinPrice = !minPrice || p.price >= Number(minPrice);
      const matchesMaxPrice = !maxPrice || p.price <= Number(maxPrice);
      return matchesCategory && matchesSubcategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  const subcategoriasDisponibles = (() => {
    if (selectedCategory === 'Todos') return [];
    if (SUBCATEGORIES[selectedCategory]) return SUBCATEGORIES[selectedCategory];
    const enUso = products
      .filter(p => (p.category || '') === selectedCategory && p.subcategory)
      .map(p => p.subcategory);
    return [...new Set(enUso)];
  })();

  const groupedByCategory = CATEGORIES.map(cat => ({
    name: cat,
    items: filteredProducts.filter(p => (p.category || 'Otros').toLowerCase() === cat.toLowerCase()),
  })).filter(group => group.items.length > 0);

  const hayFiltroPrecio = minPrice || maxPrice;

  return (
    <div className="px-1.5 sm:px-6 space-y-4 sm:space-y-8 pb-28 sm:pb-12">
      <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">
        
        {/* Renderizado condicional de los botones de Categorías y Subcategorías */}
        {!hideCategoryBar && (
          <>
            {/* Categorías */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible scrollbar-hide">
              {CATEGORIAS_CON_TODOS.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded text-[11px] sm:text-sm tracking-wide uppercase transition-all border shrink-0 whitespace-nowrap ${
                    selectedCategory === cat
                    ? 'bg-[#C4A278] text-bib-black font-semibold border-[#C4A278]'
                    : 'bg-bib-dark text-bib-white border-bib-white/10 hover:border-bib-white/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Subcategorías */}
            {subcategoriasDisponibles.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 sm:flex-wrap sm:justify-center sm:overflow-visible scrollbar-hide">
                <button
                  onClick={() => setSelectedSubcategory('')}
                  className={`px-2.5 py-1 rounded text-[10px] sm:text-[11px] tracking-wide uppercase transition-all border shrink-0 whitespace-nowrap ${
                    selectedSubcategory === ''
                    ? 'bg-bib-white text-bib-black font-medium border-bib-white'
                    : 'bg-transparent text-bib-gray border-bib-white/10 hover:border-bib-white/30'
                  }`}
                >
                  Todas
                </button>
                {subcategoriasDisponibles.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`px-2.5 py-1 rounded text-[10px] sm:text-[11px] tracking-wide uppercase transition-all border shrink-0 whitespace-nowrap ${
                      selectedSubcategory === sub
                      ? 'bg-bib-white text-bib-black font-medium border-bib-white'
                      : 'bg-transparent text-bib-gray border-bib-white/10 hover:border-bib-white/30'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Buscador y Ordenar */}
        <div className="flex flex-col md:flex-row gap-2 sm:gap-4 bg-bib-dark p-2.5 sm:p-4 rounded border border-bib-white/10">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              className="w-full bg-bib-black border border-bib-white/20 text-bib-white p-2 sm:p-3 pl-8 sm:pl-10 rounded outline-none focus:border-[#C4A278] transition-colors text-xs sm:text-base"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3.5 text-bib-white/50" size={14} />
          </div>

          <div className="flex gap-2">
            <select
              className="w-1/2 md:w-auto bg-bib-black border border-bib-white/20 text-bib-white p-2 sm:p-3 rounded outline-none cursor-pointer hover:border-bib-white/40 transition-colors text-xs sm:text-base"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Destacados</option>
              <option value="price-low">Menor precio</option>
              <option value="price-high">Mayor precio</option>
            </select>

            <div className="relative w-1/2 md:w-auto" ref={precioRef}>
              <button
                type="button"
                onClick={() => setPrecioAbierto((prev) => !prev)}
                className={`w-full flex items-center justify-center gap-1.5 p-2 sm:p-3 rounded border text-xs sm:text-base transition-colors ${
                  hayFiltroPrecio
                    ? 'bg-[#C4A278]/10 border-[#C4A278] text-[#C4A278]'
                    : 'bg-bib-black border-bib-white/20 text-bib-white hover:border-bib-white/40'
                }`}
              >
                <SlidersHorizontal size={13} />
                {hayFiltroPrecio ? `$${minPrice || '0'}-$${maxPrice || '∞'}` : 'Precio'}
                <ChevronDown size={12} className={`transition-transform duration-200 ${precioAbierto ? 'rotate-180' : ''}`} />
              </button>

              {precioAbierto && (
                <div className="absolute right-0 top-full mt-2 z-20 w-64 md:w-72 bg-bib-dark border border-bib-white/10 rounded shadow-2xl p-3 space-y-2">
                  <p className="text-[10px] text-bib-gray uppercase tracking-widest">Rango de precio</p>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Desde"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-bib-black border border-bib-white/20 text-bib-white p-2 rounded outline-none focus:border-[#C4A278] text-xs"
                    />
                    <span className="text-bib-gray text-xs">a</span>
                    <input
                      type="number"
                      placeholder="Hasta"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-bib-black border border-bib-white/20 text-bib-white p-2 rounded outline-none focus:border-[#C4A278] text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                      disabled={!hayFiltroPrecio}
                      className="text-bib-gray hover:text-[#C4A278] text-[10px] uppercase"
                    >
                      Limpiar
                    </button>
                    <button
                      onClick={() => setPrecioAbierto(false)}
                      className="bg-[#C4A278] text-bib-black font-semibold rounded px-3 py-1.5 text-[10px] uppercase"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Móvil: 2 Columnas (`grid-cols-2 gap-2`) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          {selectedCategory === 'Todos' ? (
            <div className="space-y-6 sm:space-y-12">
              {groupedByCategory.map(group => (
                <section key={group.name}>
                  <h2 className="max-w-7xl mx-auto text-xs sm:text-sm font-medium text-bib-white mb-2 sm:mb-6 tracking-widest uppercase">{group.name}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 max-w-7xl mx-auto">
                    {group.items.map(p => <ProductCard key={p.id} product={p} mostrarStockBajo={mostrarStockBajo} umbralStockBajo={umbralStockBajo} />)}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 max-w-7xl mx-auto">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} mostrarStockBajo={mostrarStockBajo} umbralStockBajo={umbralStockBajo} />)}
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center text-bib-gray text-xs sm:text-base px-4">
          No encontramos productos con ese nombre o categoría.
        </div>
      )}
    </div>
  );
}