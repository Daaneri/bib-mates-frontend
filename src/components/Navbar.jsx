import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, Search, X, ChevronDown, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { siteConfig } from '../config/site';
import { CATEGORIES, SUBCATEGORIES } from '../config/categories';
import logo from '../assets/bib-mates-logo.png';

export default function Navbar() {
  const { cart, openDrawer } = useCart();
  const { wishlist } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriaAbierta, setCategoriaAbierta] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const { openModal } = useFaqsModal();

  function cerrarMenu() {
    setMenuOpen(false);
    setCategoriaAbierta(null);
  }

  function abrirBusqueda() {
    setMenuOpen(false);
    setSearchOpen(true);
  }

  function cerrarBusqueda() {
    setSearchOpen(false);
    setSearchValue('');
  }

  function handleBuscar(e) {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/?search=${encodeURIComponent(searchValue.trim())}#seleccion`);
    cerrarBusqueda();
  }

  return (
    <nav className="sticky top-0 z-50 bg-bib-dark shadow-lg shadow-black/40 border-b border-bib-red/20">
      <div className="p-4 sm:p-6 flex justify-between items-center">
        <div className="flex items-center gap-4 sm:gap-5 flex-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-bib-white hover:text-bib-red transition-all duration-300 hover:scale-110"
            aria-label="Abrir menú"
          >
            <span className={`inline-block transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`}>
              {menuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </span>
          </button>
          <button
            onClick={abrirBusqueda}
            className="text-bib-white hover:text-bib-red transition-all duration-300 hover:scale-110"
            aria-label="Buscar productos"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
          <img
            src={logo}
            alt={`${siteConfig.businessName} Logo`}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-bib-red/50 object-cover shadow-md shadow-black/50 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-heading font-bold text-bib-white tracking-tight text-lg sm:text-xl hidden md:block truncate lowercase">
            {siteConfig.businessName}
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-5 flex-1 justify-end">
          <Link to="/favoritos" className="relative group transition-all duration-300 hover:scale-110 active:scale-95 shrink-0 text-bib-white hover:text-bib-red" aria-label="Ver favoritos">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            {wishlist.length > 0 && (
              <span className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 bg-bib-red text-bib-black text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button onClick={openDrawer} className="relative group transition-all duration-300 hover:scale-110 active:scale-95 shrink-0 text-bib-white hover:text-bib-red" aria-label="Abrir carrito">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 bg-bib-red text-bib-black text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Buscador desplegable */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out border-t ${
          searchOpen ? 'max-h-24 opacity-100 border-bib-white/10' : 'max-h-0 opacity-0 border-transparent'
        }`}
      >
        <form onSubmit={handleBuscar} className="p-4 sm:p-6 flex items-center gap-3">
          <Search size={18} className="text-bib-gray shrink-0" />
          <input
            type="text"
            autoFocus={searchOpen}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar productos..."
            className="flex-1 min-w-0 bg-transparent text-bib-white placeholder:text-bib-white/40 outline-none text-sm sm:text-base"
          />
          <button
            type="button"
            onClick={cerrarBusqueda}
            className="text-bib-gray hover:text-bib-white transition-colors shrink-0"
            aria-label="Cerrar buscador"
          >
            <X size={18} />
          </button>
        </form>
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out border-t ${
          menuOpen ? 'max-h-[80vh] opacity-100 border-bib-white/10' : 'max-h-0 opacity-0 border-transparent'
        }`}
      >
        <div className="flex flex-col text-bib-gray uppercase tracking-widest text-sm max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-4 px-6 py-4">
            <Link to="/" onClick={cerrarMenu} className="hover:text-bib-red hover:translate-x-1 transition-all duration-300 w-fit">Inicio</Link>
            <Link to="/about" onClick={cerrarMenu} className="hover:text-bib-red hover:translate-x-1 transition-all duration-300 w-fit">Nosotros</Link>
            <Link to="/opiniones" onClick={cerrarMenu} className="hover:text-bib-red hover:translate-x-1 transition-all duration-300 w-fit">Opiniones</Link>
            <Link to="/grabados" onClick={cerrarMenu} className="hover:text-bib-red hover:translate-x-1 transition-all duration-300 w-fit">Grabados</Link>
            <a href="/#faqs" onClick={cerrarMenu} className="hover:text-bib-red hover:translate-x-1 transition-all duration-300 w-fit">FAQs</a>
            <Link to="/favoritos" onClick={cerrarMenu} className="hover:text-bib-red hover:translate-x-1 transition-all duration-300 w-fit">Favoritos</Link>
          </div>

          <div className="border-t border-bib-white/10 px-6 py-4">
            <p className="text-[10px] text-bib-gray/60 mb-3">Categorías</p>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(cat => {
                const subs = SUBCATEGORIES[cat];
                const abierta = categoriaAbierta === cat;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between py-2">
                      <Link
                        to={`/?category=${encodeURIComponent(cat)}#seleccion`}
                        onClick={cerrarMenu}
                        className="hover:text-bib-red hover:translate-x-1 transition-all duration-300 flex-1 w-fit"
                      >
                        {cat}
                      </Link>
                      {subs && (
                        <button
                          onClick={() => setCategoriaAbierta(abierta ? null : cat)}
                          className="p-1 text-bib-gray hover:text-bib-white transition-colors"
                          aria-label="Ver subcategorías"
                        >
                          <ChevronDown size={16} className={`transition-transform duration-300 ${abierta ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${abierta && subs ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      {subs && (
                        <div className="flex flex-col gap-1 pl-4 pb-2 normal-case tracking-normal text-xs">
                          {subs.map(sub => (
                            <Link
                              key={sub}
                              to={`/?category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(sub)}#seleccion`}
                              onClick={cerrarMenu}
                              className="text-bib-gray hover:text-bib-red hover:translate-x-1 transition-all duration-300 py-1 w-fit"
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}