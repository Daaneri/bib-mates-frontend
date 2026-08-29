import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CATEGORIES as CATEGORIAS_INICIALES } from '../config/categories';
import { ChevronDown, Heart, ShoppingBag, X, Menu, HelpCircle, Image, MessageSquare, Users } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState(CATEGORIAS_INICIALES);
  const [subcategories, setSubcategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { wishlist } = useWishlist();
  const { cart, openDrawer } = useCart();

  const totalItemsCart = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    async function fetchData() {
      const { data: subData } = await supabase.from('subcategorias').select('*');
      if (subData) {
        setSubcategories(subData);
      }

      const { data: catData } = await supabase.from('categorias').select('nombre').order('nombre', { ascending: true });
      if (catData && catData.length > 0) {
        const nombresDB = catData.map(c => c.nombre.trim());
        const combinadas = [...CATEGORIAS_INICIALES, ...nombresDB];
        const unicas = Array.from(
          new Map(combinadas.map(c => [c.toLowerCase(), c])).values()
        );
        setCategories(unicas);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleCategoryAccordion = (cat) => {
    setOpenCategory(openCategory === cat ? null : cat);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sm:py-4 transition-shadow duration-500 ease-out ${
          isScrolled
            ? 'shadow-[0_10px_30px_rgb(0,0,0,0.06)] border-b border-transparent'
            : 'shadow-none border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="text-gray-700 hover:text-[#C4A278] transition-all duration-300 p-1.5 rounded-xl hover:bg-gray-50 active:scale-90"
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
            <Link
              to="/"
              className="text-sm sm:text-lg font-bold tracking-[0.2em] uppercase animate-shimmer-text hover:opacity-80 transition-opacity duration-300"
            >
              BIB MATES
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/favoritos"
              className="relative text-gray-700 hover:text-red-500 transition-all duration-300 p-2 rounded-xl hover:bg-gray-50 active:scale-90 flex items-center justify-center"
              aria-label="Favoritos"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="animate-fade-in absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgb(239,68,68,0.5)]">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button
              onClick={openDrawer}
              className="relative text-gray-700 hover:text-gray-900 transition-all duration-300 p-2 rounded-xl hover:bg-gray-50 active:scale-90 flex items-center justify-center"
              aria-label="Abrir carrito"
            >
              <ShoppingBag size={20} />
              {totalItemsCart > 0 && (
                <span className="animate-fade-in absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgb(0,0,0,0.3)]">
                  {totalItemsCart}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-50 transition-colors duration-500 ease-out ${isOpen ? 'bg-black/40 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'}`}>
        <div className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 transition-transform duration-500 ease-out flex flex-col shadow-[0_0_60px_rgb(0,0,0,0.15)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 sm:p-5 flex justify-between items-center border-b border-gray-100">
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Menú Principal</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 p-2 hover:text-gray-900 transition-all duration-300 rounded-xl hover:bg-gray-50 active:scale-90">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C4A278] font-extrabold mb-3">Categorías</p>
              <div className="space-y-3">
                {categories.map((cat) => {
                  const subsDeEstaCat = subcategories.filter(
                    (sub) =>
                      (sub.categoria_nombre || sub.categoria || '').toLowerCase().trim() === cat.toLowerCase().trim()
                  );

                  const tieneSubs = subsDeEstaCat.length > 0;
                  const estaAbierto = openCategory === cat;

                  return (
                    <div key={cat} className="border-b border-gray-50 pb-2.5">
                      <div
                        onClick={() => {
                          if (tieneSubs) {
                            toggleCategoryAccordion(cat);
                          }
                        }}
                        className="flex items-center justify-between cursor-pointer py-1 group"
                      >
                        <Link
                          to={`/?category=${encodeURIComponent(cat)}#seleccion`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#C4A278] group-hover:translate-x-0.5 transition-all duration-300 uppercase tracking-wide inline-block"
                        >
                          {cat}
                        </Link>
                        {tieneSubs && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleCategoryAccordion(cat); }}
                            className="text-gray-400 p-1 hover:text-gray-900 transition-colors duration-300"
                          >
                            <ChevronDown size={15} className={`transition-transform duration-300 ease-out ${estaAbierto ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {tieneSubs && estaAbierto && (
                        <div className="pl-3 mt-2 space-y-1.5 border-l-2 border-[#C4A278]/30 animate-fade-in">
                          {subsDeEstaCat.map((sub) => (
                            <Link
                              key={sub.id}
                              to={`/?category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(sub.nombre)}#seleccion`}
                              onClick={() => setIsOpen(false)}
                              className="block text-[11px] uppercase tracking-wider text-gray-500 hover:text-gray-900 hover:translate-x-0.5 transition-all duration-300 py-1 font-medium"
                            >
                              {sub.nombre}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C4A278] font-extrabold mb-3">Más secciones</p>
              <div className="space-y-1">
                <Link
                  to="/grabados"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-xs font-semibold text-gray-700 hover:text-[#C4A278] transition-all duration-300 py-2 px-2 rounded-xl hover:bg-gray-50 hover:translate-x-0.5 uppercase tracking-wide"
                >
                  <Image size={16} className="text-[#C4A278]" />
                  Galería de Grabados
                </Link>
                <Link
                  to="/opiniones"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-xs font-semibold text-gray-700 hover:text-[#C4A278] transition-all duration-300 py-2 px-2 rounded-xl hover:bg-gray-50 hover:translate-x-0.5 uppercase tracking-wide"
                >
                  <MessageSquare size={16} className="text-[#C4A278]" />
                  Opiniones
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-xs font-semibold text-gray-700 hover:text-[#C4A278] transition-all duration-300 py-2 px-2 rounded-xl hover:bg-gray-50 hover:translate-x-0.5 uppercase tracking-wide"
                >
                  <Users size={16} className="text-[#C4A278]" />
                  Nosotros
                </Link>
                <Link
                  to="/faq"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-xs font-semibold text-gray-700 hover:text-[#C4A278] transition-all duration-300 py-2 px-2 rounded-xl hover:bg-gray-50 hover:translate-x-0.5 uppercase tracking-wide"
                >
                  <HelpCircle size={16} className="text-[#C4A278]" />
                  Preguntas Frecuentes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}