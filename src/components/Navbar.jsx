import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, Search, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../config/site';
import logo from '../assets/bib-mates-logo.png';

export default function Navbar() {
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-bib-dark shadow-lg shadow-black/40 border-b border-bib-red/20">
      <div className="p-4 sm:p-6 flex justify-between items-center">
        <div className="flex items-center gap-4 sm:gap-5 flex-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-bib-white hover:text-bib-red transition duration-300"
            aria-label="Abrir menú"
          >
            {menuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
          <button className="hidden sm:block text-bib-white hover:text-bib-red transition duration-300" aria-label="Buscar">
            <Search className="w-5 h-5" />
          </button>
        </div>

        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img
            src={logo}
            alt={`${siteConfig.businessName} Logo`}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-bib-red/50 object-cover shadow-md shadow-black/50"
          />
          <span className="font-heading font-bold text-bib-white tracking-tight text-lg sm:text-xl hidden md:block truncate lowercase">
            {siteConfig.businessName}
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-5 flex-1 justify-end">
          <Link to="/cart" className="relative group transition-all duration-300 hover:scale-110 active:scale-95 shrink-0 text-bib-white hover:text-bib-red">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 bg-bib-red text-bib-black text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-4 px-6 pb-6 text-bib-gray uppercase tracking-widest text-sm border-t border-bib-white/10 pt-4">
          <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-bib-red transition duration-300">Inicio</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="hover:text-bib-red transition duration-300">Nosotros</Link>
          <Link to="/opiniones" onClick={() => setMenuOpen(false)} className="hover:text-bib-red transition duration-300">Opiniones</Link>
        </div>
      )}
    </nav>
  )
}