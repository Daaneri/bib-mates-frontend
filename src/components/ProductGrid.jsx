import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Search, ImageOff, Heart, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { CATEGORIES, SUBCATEGORIES } from '../config/categories'
import { useWishlist } from '../hooks/useWishlist'

const CATEGORIAS_CON_TODOS = ['Todos', ...CATEGORIES];

function ProductCardSkeleton() {
  return (
    <div className="bg-bib-dark p-3 sm:p-4 md:p-6 rounded md:rounded-md border border-bib-white/10 flex flex-col animate-pulse">
      <div className="aspect-[4/5] bg-bib-card rounded mb-3 sm:mb-4 md:mb-6" />
      <div className="h-3 bg-bib-card rounded w-3/4 mb-2" />
      <div className="h-3 bg-bib-card rounded w-1/3 mb-4" />
      <div className="h-8 bg-bib-card rounded" />
    </div>
  );
}

function ProductCard({ product, mostrarStockBajo, umbralStockBajo }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const sinStock = (product.stock ?? 0) === 0;
  const stockBajo = mostrarStockBajo && !sinStock && (product.stock ?? 0) < umbralStockBajo;

  return (
    <div className="group bg-bib-dark p-3 sm:p-4 md:p-6 rounded md:rounded-md border border-bib-white/10 transition-all duration-300 hover:border-bib-red/50 flex flex-col relative">
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-2 right-2 z-10 bg-bib-black/70 backdrop-blur-sm p-1.5 rounded-full text-bib-white hover:scale-110 transition-transform"
        aria-label={isWishlisted(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart size={16} className={isWishlisted(product.id) ? 'fill-bib-red text-bib-red' : ''} />
      </button>

      <div className="aspect-[4/5] bg-bib-card rounded overflow-hidden mb-3 sm:mb-4 md:mb-6 relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 h-full text-bib-white/20">
            <ImageOff size={28} strokeWidth={1.25} />
            <span className="uppercase tracking-widest text-[10px]">Sin imagen</span>
          </div>
        )}
        {sinStock && (
          <span className="absolute top-2 left-2 bg-bib-black/90 border border-bib-white/20 text-bib-white/80 text-[9px] sm:text-[10px] uppercase tracking-widest px-2 sm:px-3 py-1 rounded">
            Sin stock
          </span>
        )}
        {stockBajo && (
          <span className="absolute top-2 left-2 bg-yellow-500/90 text-black text-[9px] sm:text-[10px] font-medium uppercase tracking-widest px-2 sm:px-3 py-1 rounded">
            ¡Últimas {product.stock}!
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm md:text-lg font-medium text-bib-white mb-1 truncate">{product.name}</h3>
          <p className="text-xs sm:text-sm md:text-lg font-medium text-bib-red mb-3 sm:mb-4">${product.price.toLocaleString('es-AR')}</p>
        </div>
        <Link to={`/producto/${product.id}`} className="block">
          <button
            disabled={sinStock}
            className={`w-full border py-2 md:py-4 rounded font-medium text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 ${
              sinStock
                ? 'border-bib-white/10 text-bib-white/30 cursor-not-allowed'
                : 'border-bib-white/20 text-bib-white hover:bg-bib-red hover:border-bib-red hover:text-bib-black'
            }`}
          >
            {sinStock ? 'Sin stock' : 'Ver detalle'}
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState('default')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Todos')
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [precioAbierto, setPrecioAbierto] = useState(false)
  const precioRef = useRef(null)

  // Config del cartel de "últimas unidades" — editable desde el panel admin
  const [mostrarStockBajo, setMostrarStockBajo] = useState(true)
  const [umbralStockBajo, setUmbralStockBajo] = useState(5)

  // Cierra el dropdown de precio si tocás afuera
  useEffect(() => {
    function handleClickAfuera(e) {
      if (precioRef.current && !precioRef.current.contains(e.target)) {
        setPrecioAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickAfuera)
    return () => document.removeEventListener('mousedown', handleClickAfuera)
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from('productos').select('*')
      if (error) console.error("Error al traer productos:", error)
      else setProducts(data)
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
    fetchProducts()
    fetchSettings()
  }, [])

  // Si llega un ?search= nuevo desde la lupa del Navbar (aunque ya estemos parados en esta página),
  // actualizamos el campo de búsqueda para que se sincronice con la URL.
  useEffect(() => {
    const paramSearch = searchParams.get('search');
    if (paramSearch !== null) {
      setSearchTerm(paramSearch);
    }
  }, [searchParams])

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
    <div className="px-4 sm:px-6 space-y-6 sm:space-y-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible scrollbar-hide">
          {CATEGORIAS_CON_TODOS.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 sm:px-6 py-2 rounded text-xs sm:text-sm tracking-wide uppercase transition-all border shrink-0 whitespace-nowrap ${
                selectedCategory === cat
                ? 'bg-bib-red text-bib-black font-medium border-bib-red'
                : 'bg-bib-dark text-bib-white border-bib-white/10 hover:border-bib-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {subcategoriasDisponibles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible scrollbar-hide">
            <button
              onClick={() => setSelectedSubcategory('')}
              className={`px-3 py-1.5 rounded text-[11px] tracking-wide uppercase transition-all border shrink-0 whitespace-nowrap ${
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
                className={`px-3 py-1.5 rounded text-[11px] tracking-wide uppercase transition-all border shrink-0 whitespace-nowrap ${
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

        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 bg-bib-dark p-3 sm:p-4 rounded border border-bib-white/10">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              className="w-full bg-bib-black border border-bib-white/20 text-bib-white p-3 pl-10 rounded outline-none focus:border-bib-red transition-colors text-sm sm:text-base"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-bib-white/50" size={18} />
          </div>

          <select
            className="w-full md:w-auto bg-bib-black border border-bib-white/20 text-bib-white p-3 rounded outline-none cursor-pointer hover:border-bib-white/40 transition-colors text-sm sm:text-base"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Más destacados</option>
            <option value="price-low">Precio: más barato</option>
            <option value="price-high">Precio: más caro</option>
          </select>

          <div className="relative shrink-0" ref={precioRef}>
            <button
              type="button"
              onClick={() => setPrecioAbierto((prev) => !prev)}
              className={`w-full md:w-auto flex items-center justify-center gap-2 p-3 rounded border text-sm sm:text-base transition-colors ${
                hayFiltroPrecio
                  ? 'bg-bib-red/10 border-bib-red text-bib-red'
                  : 'bg-bib-black border-bib-white/20 text-bib-white hover:border-bib-white/40'
              }`}
            >
              <SlidersHorizontal size={16} />
              {hayFiltroPrecio
                ? `$${minPrice || '0'} - $${maxPrice || '∞'}`
                : 'Precio'}
              <ChevronDown size={14} className={`transition-transform duration-200 ${precioAbierto ? 'rotate-180' : ''}`} />
            </button>

            {precioAbierto && (
              <div className="absolute right-0 md:right-0 top-full mt-2 z-20 w-full md:w-72 bg-bib-dark border border-bib-white/10 rounded shadow-2xl p-4 space-y-3">
                <p className="text-xs text-bib-gray uppercase tracking-widest">Rango de precio</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Desde"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-bib-black border border-bib-white/20 text-bib-white p-2.5 rounded outline-none focus:border-bib-red transition-colors text-sm"
                  />
                  <span className="text-bib-gray text-xs shrink-0">a</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Hasta"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-bib-black border border-bib-white/20 text-bib-white p-2.5 rounded outline-none focus:border-bib-red transition-colors text-sm"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                    disabled={!hayFiltroPrecio}
                    className="text-bib-gray hover:text-bib-red disabled:opacity-30 disabled:hover:text-bib-gray text-xs uppercase tracking-widest transition-colors"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setPrecioAbierto(false)}
                    className="bg-bib-red hover:bg-bib-white text-bib-black font-medium rounded px-4 py-2 text-xs uppercase tracking-widest transition-colors"
                  >
                    Listo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {!loading && filteredProducts.length > 0 && (
          <p className="text-xs sm:text-sm text-bib-gray text-center tracking-wide">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          {selectedCategory === 'Todos' ? (
            <div className="space-y-8 sm:space-y-12">
              {groupedByCategory.map(group => (
                <section key={group.name}>
                  <h2 className="max-w-7xl mx-auto text-sm font-medium text-bib-white mb-4 sm:mb-6 tracking-widest uppercase">{group.name}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-7xl mx-auto">
                    {group.items.map(p => <ProductCard key={p.id} product={p} mostrarStockBajo={mostrarStockBajo} umbralStockBajo={umbralStockBajo} />)}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-7xl mx-auto">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} mostrarStockBajo={mostrarStockBajo} umbralStockBajo={umbralStockBajo} />)}
            </div>
          )}
        </>
      ) : (
        <div className="py-16 sm:py-20 text-center text-bib-gray text-sm sm:text-base px-4">
          No encontramos productos con ese nombre o categoría.
        </div>
      )}
    </div>
  )
}