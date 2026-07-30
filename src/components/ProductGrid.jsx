import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Search, ImageOff } from 'lucide-react'
import { CATEGORIES, SUBCATEGORIES } from '../config/categories'
import FadeIn from './FadeIn'

const CATEGORIAS_CON_TODOS = ['Todos', ...CATEGORIES];

function ProductCard({ product }) {
  const sinStock = (product.stock ?? 0) === 0;

  return (
    <div className="group bg-bib-dark p-3 sm:p-4 md:p-6 rounded md:rounded-md border border-bib-white/10 transition-all duration-300 hover:border-bib-red/50 hover:-translate-y-1 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.7)] flex flex-col relative">
      <div className="aspect-[4/5] bg-bib-card rounded overflow-hidden mb-3 sm:mb-4 md:mb-6 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
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
                : 'border-bib-white/20 text-bib-white hover:bg-bib-red hover:border-bib-red hover:text-bib-white'
            }`}
          >
            {sinStock ? 'Sin stock' : 'Ver detalle'}
          </button>
        </Link>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-bib-dark p-3 sm:p-4 md:p-6 rounded md:rounded-md border border-bib-white/10 flex flex-col">
      <div className="aspect-[4/5] rounded mb-3 sm:mb-4 md:mb-6 bg-bib-card animate-pulse" />
      <div className="h-3 w-3/4 rounded bg-bib-white/10 mb-2 animate-pulse" />
      <div className="h-3 w-1/3 rounded bg-bib-white/10 mb-3 sm:mb-4 animate-pulse" />
      <div className="h-8 md:h-11 w-full rounded bg-bib-white/5 animate-pulse" />
    </div>
  );
}

export default function ProductGrid() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Todos')
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '')

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const { data, error } = await supabase.from('productos').select('*')
      if (error) console.error("Error al traer productos:", error)
      else setProducts(data)
      setLoading(false)
    }
    fetchProducts()
  }, [])

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
      return matchesCategory && matchesSubcategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  // Subcategorías disponibles para la categoría elegida: usa la lista fija si existe,
  // si no, saca los valores reales cargados en los productos de esa categoría.
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

  return (
    <div className="px-4 sm:px-6 space-y-6 sm:space-y-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible scrollbar-hide">
          {CATEGORIAS_CON_TODOS.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 sm:px-6 py-2 rounded text-xs sm:text-sm tracking-wide uppercase transition-all duration-300 border shrink-0 whitespace-nowrap ${
                selectedCategory === cat
                ? 'bg-bib-red text-bib-white font-medium border-bib-red'
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
                    {group.items.map((p, i) => (
                      <FadeIn key={p.id} delay={Math.min(i * 40, 320)}>
                        <ProductCard product={p} />
                      </FadeIn>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-7xl mx-auto">
              {filteredProducts.map((p, i) => (
                <FadeIn key={p.id} delay={Math.min(i * 40, 320)}>
                  <ProductCard product={p} />
                </FadeIn>
              ))}
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