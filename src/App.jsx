import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Menu, X, Heart, ShoppingBag } from 'lucide-react';
import Home from './pages/Home';
// Importá tus otras páginas y componentes según corresponda...

const MARQUEE_TEXT = "• ENVÍO GRATIS EN COMPRAS DESDE $120.000 • HASTA 3 CUOTAS SIN INTERÉS • 🔥 20% OFF PAGANDO CON MERCADO PAGO ";

// Navbar unificado con un solo Ticker integrado
function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bib-black/95 backdrop-blur-md border-b border-bib-white/15">
      {/* Ticker / Anuncio Superior (Único) */}
      <div className="overflow-hidden bg-[#C4A278] py-1.5 whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <span className="text-[10px] sm:text-[11px] font-bold text-bib-black uppercase tracking-widest">
            {MARQUEE_TEXT.repeat(2)}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between relative">
        {/* Logotipo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading font-bold text-lg sm:text-xl tracking-wider text-bib-white">
            BIB MATES
          </span>
        </Link>

        {/* Enlaces de Navegación Principales */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="relative">
            <button 
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-bib-white hover:text-[#C4A278] transition-colors font-medium py-2 focus:outline-none"
            >
              Categorías
              <Menu size={14} className={`transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Modal / Menú desplegable de Categorías */}
            {categoriesOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-bib-black border border-bib-white/10 shadow-2xl rounded py-2 flex flex-col z-50">
                <Link 
                  to="/?category=Mates#seleccion" 
                  onClick={() => setCategoriesOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-[0.15em] text-bib-white hover:bg-[#C4A278] hover:text-bib-black transition-colors"
                >
                  Mates
                </Link>
                <Link 
                  to="/?category=Bombillas#seleccion" 
                  onClick={() => setCategoriesOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-[0.15em] text-bib-white hover:bg-[#C4A278] hover:text-bib-black transition-colors"
                >
                  Bombillas
                </Link>
                <Link 
                  to="/?category=Termos#seleccion" 
                  onClick={() => setCategoriesOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-[0.15em] text-bib-white hover:bg-[#C4A278] hover:text-bib-black transition-colors"
                >
                  Termos
                </Link>
                <Link 
                  to="/?category=Accesorios#seleccion" 
                  onClick={() => setCategoriesOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-[0.15em] text-bib-white hover:bg-[#C4A278] hover:text-bib-black transition-colors"
                >
                  Accesorios
                </Link>
              </div>
            )}
          </div>

          <Link to="/grabados" className="text-xs uppercase tracking-[0.2em] text-bib-white hover:text-[#C4A278] transition-colors font-medium">
            Grabados
          </Link>
          <Link to="/about" className="text-xs uppercase tracking-[0.2em] text-bib-white hover:text-[#C4A278] transition-colors font-medium">
            Nosotros
          </Link>
          <Link to="/opiniones" className="text-xs uppercase tracking-[0.2em] text-bib-white hover:text-[#C4A278] transition-colors font-medium">
            Opiniones
          </Link>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <Link to="/favoritos" aria-label="Favoritos" className="text-bib-white hover:text-[#C4A278] transition-colors">
            <Heart size={20} />
          </Link>
          <Link to="/cart" aria-label="Carrito" className="relative text-bib-white hover:text-[#C4A278] transition-colors">
            <ShoppingBag size={20} />
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            aria-label="Menú"
            className="md:hidden text-bib-white hover:text-[#C4A278] transition-colors p-1"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-bib-black border-b border-bib-white/10 shadow-2xl py-6 px-6 flex flex-col gap-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#C4A278] font-bold">Categorías</div>
          <Link to="/?category=Mates#seleccion" onClick={() => setMobileMenuOpen(false)} className="text-xs uppercase tracking-[0.2em] text-bib-white hover:text-[#C4A278] font-medium py-1 pl-2">Mates</Link>
          <Link to="/?category=Bombillas#seleccion" onClick={() => setMobileMenuOpen(false)} className="text-xs uppercase tracking-[0.2em] text-bib-white hover:text-[#C4A278] font-medium py-1 pl-2">Bombillas</Link>
          <Link to="/?category=Termos#seleccion" onClick={() => setMobileMenuOpen(false)} className="text-xs uppercase tracking-[0.2em] text-bib-white hover:text-[#C4A278] font-medium py-1 pl-2">Termos</Link>
          <Link to="/?category=Accesorios#seleccion" onClick={() => setMobileMenuOpen(false)} className="text-xs uppercase tracking-[0.2em] text-bib-white hover:text-[#C4A278] font-medium py-1 pl-2 border-b border-bib-white/10 pb-4">Accesorios</Link>
          
          <Link to="/grabados" onClick={() => setMobileMenuOpen(false)} className="text-xs uppercase tracking-[0.2em] text-bib-white hover:text-[#C4A278] font-medium py-2">Grabados</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-xs uppercase tracking-[0.2em] text-bib-white hover:text-[#C4A278] font-medium py-2">Nosotros</Link>
          <Link to="/opiniones" onClick={() => setMobileMenuOpen(false)} className="text-xs uppercase tracking-[0.2em] text-bib-white hover:text-[#C4A278] font-medium py-2">Opiniones</Link>
        </div>
      )}
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bib-black text-bib-white flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Agregá el resto de tus rutas aquí */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}