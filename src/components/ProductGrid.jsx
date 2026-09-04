import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ImageOff, Heart, SlidersHorizontal, ChevronDown, ShoppingBag } from 'lucide-react';
import { CATEGORIES } from '../config/categories';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../context/CartContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://bib-mates-backend.onrender.com";

const CATEGORIAS_CON_TODOS = ['Todos', ...CATEGORIES];

function precioFinal(product) {
  if (product.descuento_porcentaje > 0) {
    return Math.round(product.price * (1 - product.descuento_porcentaje / 100));
  }
  return product.price;
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white p-3 rounded-2xl flex flex-col animate-pulse shadow-[0_10px_40px_rgb(0,0,0,0.05)]">
      <div className="aspect-square bg-gray-100 rounded-xl mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-4/5 mb-3" />
      <div className="h-5 bg-gray-100 rounded w-1/2 mb-4" />
      <div className="h-9 bg-gray-100 rounded-xl mt-auto" />
    </div>
  );
}

function ProductCard({ product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart, openDrawer } = useCart();

  const sinStock = (product.stock ?? 0) === 0;

  const precioLista = precioFinal(product);
  const cuotaMonto = Math.round(precioLista / 3);
  const precioTransferencia = product.price_cash ? product.price_cash : Math.round(precioLista * 0.80);

  function handleComprarRapido(e) {
    e.preventDefault();
    if (sinStock) return;
    addToCart({ ...product, price: precioLista });
    openDrawer();
  }

  return (
    <div className="group bg-white p-3 sm:p-4 rounded-2xl transition-all duration-500 ease-out hover:-translate-y-1.5 shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] flex flex-col justify-between relative h-full">
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white/90 backdrop-blur-md p-2 rounded-full text-gray-500 hover:text-red-500 transition-all duration-200 active:scale-125 shadow-sm"
        aria-label={isWishlisted(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart size={15} className={isWishlisted(product.id) ? 'fill-red-500 text-red-500' : ''} />
      </button>

      <div>
        <Link to={`/producto/${product.id}`} className="block aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 relative">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 h-full text-gray-400">
              <ImageOff size={22} strokeWidth={1.5} />
              <span className="uppercase tracking-widest text-[9px] font-medium">Sin imagen</span>
            </div>
          )}
          {sinStock && (
            <span className="absolute bottom-2 left-2 bg-gray-900/90 backdrop-blur-sm text-white text-[9px] font-medium uppercase tracking-wider px-2 py-1 rounded-md z-10">
              Sin stock
            </span>
          )}
        </Link>

        <div className="space-y-1.5 mb-4">
          <Link to={`/producto/${product.id}`} className="block">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{product.category}</p>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#C4A278] transition-colors duration-300">
              {product.name}
            </h3>
          </Link>

          {product.descuento_porcentaje > 0 ? (
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] sm:text-xs text-gray-400 line-through font-medium">
                  ${Number(product.price).toLocaleString('es-AR')}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 tracking-widest">
                  {product.descuento_porcentaje}% OFF
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                ${precioLista.toLocaleString('es-AR')}
              </p>
            </div>
          ) : (
            <div className="pt-0.5">
              <p className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                ${Number(product.price).toLocaleString('es-AR')}
              </p>
            </div>
          )}

          <div className="space-y-0.5 pt-1 border-t border-gray-50">
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium leading-tight">
              3 cuotas sin interés de <span className="font-semibold text-gray-800">${cuotaMonto.toLocaleString('es-AR')}</span>
            </p>

          <div className="bg-[#EFECE6] border-l-4 border-[#8B5A2B] px-2.5 py-1.5 rounded-r-md text-left">
            <p className="text-xs sm:text-sm font-bold text-[#1C1C1C] leading-tight">
              ${precioTransferencia.toLocaleString('es-AR')} con
            </p>
            <p className="text-[10px] sm:text-xs font-semibold text-[#1C1C1C] leading-tight">
              Transferencia
            </p>
          </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleComprarRapido}
        disabled={sinStock}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 mt-auto ${
          sinStock
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
            : 'bg-gray-900 hover:bg-[#C4A278] text-white hover:text-gray-900 active:scale-[0.98] shadow-[0_8px_20px_rgb(0,0,0,0.15)]'
        }`}
      >
        <ShoppingBag size={15} />
        {sinStock ? 'Sin stock' : 'Comprar'}
      </button>
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
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [productsRes, subRes, settingsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/productos`).then(res => res.json()),
          fetch(`${BACKEND_URL}/api/subcategorias`).then(res => res.json()),
          fetch(`${BACKEND_URL}/api/site-settings`).then(res => res.json()).catch(() => null)
        ]);

        if (!isMounted) return;

        setProducts(Array.isArray(productsRes) ? productsRes : []);
        setAllSubcategories(Array.isArray(subRes) ? subRes : []);

        const settingsData = Array.isArray(settingsRes) ? settingsRes[0] : settingsRes;
        if (settingsData) {
          setMostrarStockBajo(settingsData.mostrar_stock_bajo ?? true);
          setUmbralStockBajo(settingsData.umbral_stock_bajo ?? 5);
        }
      } catch (err) {
        console.error("Error al cargar productos desde la API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizeText = (str) => 
    (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const subcategoriasDisponibles = useMemo(() => {
    if (selectedCategory.toLowerCase() === 'todos') return [];

    return allSubcategories
      .filter(item => {
        const itemCat = normalizeText(item.categoria_nombre || item.categoria);
        const currentCat = normalizeText(selectedCategory);
        return itemCat === currentCat;
      })
      .map(item => item.nombre)
      .filter((val, index, self) => self.indexOf(val) === index);
  }, [selectedCategory, allSubcategories]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (precioRef.current && !precioRef.current.contains(event.target)) {
        setPrecioAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const categoryLower = selectedCategory.toLowerCase();
    const subcategoryLower = selectedSubcategory.toLowerCase();
    const minP = minPrice ? Number(minPrice) : null;
    const maxP = maxPrice ? Number(maxPrice) : null;

    return products
      .filter(p => p.archivado !== true)
      .filter(p => {
        const productCat = (p.category || 'Otros').toLowerCase();
        const matchesCategory = categoryLower === 'todos' || productCat === categoryLower;
        const matchesSubcategory = !selectedSubcategory || (p.subcategory || '').toLowerCase() === subcategoryLower;
        const matchesSearch = p.name.toLowerCase().includes(searchLower);
        
        const precioEfectivo = precioFinal(p);
        const matchesMinPrice = minP === null || precioEfectivo >= minP;
        const matchesMaxPrice = maxP === null || precioEfectivo <= maxP;

        return matchesCategory && matchesSubcategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
      })
      .sort((a, b) => {
        const precioA = precioFinal(a);
        const precioB = precioFinal(b);
        if (sortBy === 'price-low') return precioA - precioB;
        if (sortBy === 'price-high') return precioB - precioA;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
        return 0;
      });
  }, [products, selectedCategory, selectedSubcategory, searchTerm, minPrice, maxPrice, sortBy]);

  return (
    <div id="seleccion" className="px-2 sm:px-6 space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      <div className="max-w-6xl mx-auto space-y-4">
        {!hideCategoryBar && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible scrollbar-hide">
              {CATEGORIAS_CON_TODOS.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSubcategory('');
                    setSearchParams({ category: cat });
                  }}
                  className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm tracking-wide font-medium uppercase transition-all duration-300 border shrink-0 whitespace-nowrap active:scale-95 ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-gray-900 text-white border-gray-900 shadow-[0_8px_20px_rgb(0,0,0,0.15)]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {selectedCategory.toLowerCase() !== 'todos' && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-3 px-4 bg-white rounded-2xl shadow-[0_10px_30px_rgb(0,0,0,0.05)] animate-fade-in scrollbar-hide">
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-bold mr-2">
                  Filtrar {selectedCategory}:
                </span>
                
                <button
                  onClick={() => {
                    setSelectedSubcategory('');
                    setSearchParams({ category: selectedCategory });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs tracking-wide uppercase transition-all duration-300 border shrink-0 whitespace-nowrap font-medium active:scale-95 ${
                    selectedSubcategory === ''
                      ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
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
                    className={`px-3 py-1.5 rounded-lg text-xs tracking-wide uppercase transition-all duration-300 border shrink-0 whitespace-nowrap font-medium active:scale-95 ${
                      selectedSubcategory.toLowerCase() === sub.toLowerCase()
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all duration-300 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors duration-300"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative" ref={precioRef}>
              <button
                onClick={() => setPrecioAbierto(!precioAbierto)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all duration-300 shadow-sm font-medium active:scale-95 ${
                  minPrice || maxPrice
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>Precio</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${precioAbierto ? 'rotate-180' : ''}`} />
              </button>

              {precioAbierto && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgb(0,0,0,0.15)] p-4 z-30 space-y-3 animate-fade-in">
                  <div className="text-xs font-bold text-gray-900 uppercase tracking-widest">Filtrar por precio</div>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Mínimo</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        placeholder="$ 0"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-900 transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Máximo</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        placeholder="$ Sin límite"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-900 transition-colors duration-300"
                      />
                    </div>
                  </div>
                  {(minPrice || maxPrice) && (
                    <button
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                      }}
                      className="w-full text-center text-xs text-gray-900 hover:underline pt-1 font-semibold"
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
              className="flex-1 sm:flex-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-700 focus:outline-none focus:border-gray-900 transition-all duration-300 cursor-pointer shadow-sm font-medium"
            >
              <option value="default" className="bg-white text-gray-900">Ordenar por</option>
              <option value="newest" className="bg-white text-gray-900">Más recientes</option>
              <option value="price-low" className="bg-white text-gray-900">Menor precio</option>
              <option value="price-high" className="bg-white text-gray-900">Mayor precio</option>
              <option value="name-asc" className="bg-white text-gray-900">A - Z</option>
              <option value="name-desc" className="bg-white text-gray-900">Z - A</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-7xl mx-auto">
          {filteredProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl max-w-xl mx-auto p-8 shadow-[0_10px_40px_rgb(0,0,0,0.06)]">
          <div className="text-gray-300 flex justify-center"><Search size={44} strokeWidth={1.5} /></div>
          <p className="text-gray-800 font-medium text-sm">No se encontraron productos que coincidan con tu búsqueda.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Todos');
              setSelectedSubcategory('');
              setMinPrice('');
              setMaxPrice('');
            }}
            className="text-xs text-gray-900 underline hover:text-[#C4A278] transition-colors duration-300 font-semibold"
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}
    </div>
  );
}