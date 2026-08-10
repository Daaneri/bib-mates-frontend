import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { CATEGORIES as CATEGORIAS_INICIALES } from '../../config/categories';
import { ChevronDown, Heart, ShoppingBag, X, Menu, HelpCircle, Image, MessageSquare, Users } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState(CATEGORIAS_INICIALES);
  const [subcategories, setSubcategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const { wishlist } = useWishlist();

  useEffect(() => {
    async function fetchData() {
      // Cargar subcategorías
      const { data: subData } = await supabase.from('subcategorias').select('*');
      if (subData) {
        setSubcategories(subData);
      }

      // Cargar categorías de Supabase y normalizar para evitar duplicados
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

  const toggleCategoryAccordion = (cat) => {
    setOpenCategory(openCategory === cat ? null : cat);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-bib-black/90 backdrop-blur-md border-b border-bib-white/10 px-4 sm:px-8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="text-bib-white hover:text-[#C4A278] transition-colors p-1"
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
            <Link to="/" className="text-sm sm:text-lg font-bold tracking-widest uppercase text-bib-white">
              BIB MATES
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/favoritos" className="relative text-bib-white hover:text-[#C4A278] transition-colors p-1">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C4A278] text-bib-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="text-bib-white hover:text-[#C4A278] transition-colors p-1">
              <ShoppingBag size={20} />
            </Link>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-50 transition-colors duration-300 ${isOpen ? 'bg-black/80 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'}`}>
        <div className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-bib-dark border-r border-bib-white/10 z-50 transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 flex justify-between items-center border-b border-bib-white/10">
            <span className="text-xs uppercase tracking-widest text-bib-white/60 font-medium">Menú Principal</span>
            <button onClick={() => setIsOpen(false)} className="text-bib-white p-2 hover:text-[#C4A278] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Sección de Categorías de Productos */}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[#C4A278] font-bold mb-3">Categorías</p>
              <div className="space-y-4">
                {categories.map((cat) => {
                  const subsDeEstaCat = subcategories.filter(
                    (sub) => 
                      (sub.categoria_nombre || sub.categoria || '').toLowerCase().trim() === cat.toLowerCase().trim()
                  );

                  const tieneSubs = subsDeEstaCat.length > 0;
                  const estaAbierto = openCategory === cat;

                  return (
                    <div key={cat} className="border-b border-bib-white/10 pb-3">
                      <div 
                        onClick={() => {
                          if (tieneSubs) {
                            toggleCategoryAccordion(cat);
                          }
                        }}
                        className="flex items-center justify-between cursor-pointer py-1"
                      >
                        <Link 
                          to={`/?category=${encodeURIComponent(cat)}#seleccion`} 
                          onClick={() => setIsOpen(false)}
                          className="text-base font-semibold text-bib-white hover:text-[#C4A278] transition-colors"
                        >
                          {cat}
                        </Link>
                        {tieneSubs && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleCategoryAccordion(cat); }}
                            className="text-bib-white/70 p-1"
                          >
                            <ChevronDown size={16} className={`transition-transform duration-200 ${estaAbierto ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {tieneSubs && estaAbierto && (
                        <div className="pl-4 mt-2 space-y-2 border-l border-[#C4A278]/30 animate-fadeIn">
                          {subsDeEstaCat.map((sub) => (
                            <Link
                              key={sub.id}
                              to={`/?category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(sub.nombre)}#seleccion`}
                              onClick={() => setIsOpen(false)}
                              className="block text-xs uppercase tracking-wider text-bib-white/70 hover:text-[#C4A278] transition-colors py-1"
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

            {/* Sección de Enlaces Adicionales */}
            <div className="pt-2 border-t border-bib-white/10">
              <p className="text-[11px] uppercase tracking-widest text-[#C4A278] font-bold mb-3">Más secciones</p>
              <div className="space-y-2">
                <Link
                  to="/grabados"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-bib-white/80 hover:text-[#C4A278] transition-colors py-2"
                >
                  <Image size={18} className="text-[#C4A278]" />
                  Galería de Grabados
                </Link>
                <Link
                  to="/opiniones"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-bib-white/80 hover:text-[#C4A278] transition-colors py-2"
                >
                  <MessageSquare size={18} className="text-[#C4A278]" />
                  Opiniones
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-bib-white/80 hover:text-[#C4A278] transition-colors py-2"
                >
                  <Users size={18} className="text-[#C4A278]" />
                  Nosotros
                </Link>
                <Link
                  to="/faq"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-bib-white/80 hover:text-[#C4A278] transition-colors py-2"
                >
                  <HelpCircle size={18} className="text-[#C4A278]" />
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