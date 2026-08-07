import React, { Suspense, lazy, Component, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { MessageCircle, ShoppingBag, Heart, Menu, X } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
import CheckoutEntrega from './components/CheckoutEntrega';
import { siteConfig } from './config/site';

// Componentes Públicos
import Home from './components/Home';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import About from './components/About';
import Opiniones from './components/Opiniones';
import Footer from './components/Footer';
import FloatingCart from './components/FloatingCart';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';
import AnalyticsTracker from './components/AnalyticsTracker';
import CookieBanner from './components/CookieBanner';
import { PrivacyPolicy, TermsOfService } from './pages/LegalPages';
import PagoExito from './components/PagoExito';
import PagoError from './components/PagoError';
import PagoPendiente from './components/PagoPendiente';
import PagoTransferencia from './components/PagoTransferencia';
import Favoritos from './components/Favoritos';
import NotFound from './components/NotFound';
import Grabados from './components/Grabados';

// Componentes Administrativos
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCarritos = lazy(() => import('./pages/AdminCarritos'));
const Login = lazy(() => import('./pages/Login'));

const MARQUEE_TEXT = "🔥 20% OFF PAGANDO CON MERCADO PAGO • ENVÍO GRATIS EN COMPRAS DESDE $120.000 • HASTA 3 CUOTAS SIN INTERÉS • ";

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Navbar con Header unificado y Modal integrado
// Navbar con Header unificado y Modal de Categorías Completo
function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bib-black/95 backdrop-blur-md border-b border-bib-white/10">
      {/* Ticker / Anuncio Superior */}
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
            {siteConfig?.businessName || 'BIB MATES'}
          </span>
        </Link>

        {/* Enlaces de Navegación Principales con Dropdown de Categorías */}
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
        <div className="md:hidden absolute top-full left-0 w-full bg-bib-black border-b border-bib-white/10 shadow-2xl py-6 px-6 flex flex-col gap-4 animate-fadeIn">
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
  

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bib-black text-bib-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Ocurrió un problema temporal</h2>
          <button onClick={() => window.location.reload()} className="bg-bib-red text-bib-white px-4 py-2 rounded font-semibold mt-4">
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PublicRoutes() {
  const location = useLocation();
  const cleanWhatsappNumber = siteConfig?.whatsapp ? String(siteConfig.whatsapp).replace(/[^0-9]/g, '') : '';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-bib-black text-bib-white selection:bg-bib-red selection:text-bib-black">
      <Toaster position="bottom-right" richColors />
      <Navbar />
      <FloatingCart />
      <CartDrawer />
      <CookieBanner />

      {cleanWhatsappNumber && (
        <a 
          href={`https://wa.me/${encodeURIComponent(cleanWhatsappNumber)}`} 
          target="_blank" 
          rel="noopener noreferrer nofollow"
          aria-label="WhatsApp"
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 bg-[#25D366] text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
        >
          <MessageCircle size={22} />
        </a>
      )}

      <main className="flex-grow">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<div className="p-8 max-w-4xl mx-auto min-h-[60vh] mt-10"><CartPage /></div>} />
          <Route path="/producto/:id" element={<div className="p-8 max-w-6xl mx-auto min-h-[60vh] mt-10"><ProductDetail /></div>} />
          <Route path="/about" element={<div className="p-8 max-w-4xl mx-auto min-h-[60vh] mt-10"><About /></div>} />
          <Route path="/opiniones" element={<div className="p-8 max-w-4xl mx-auto min-h-[60vh] mt-10"><Opiniones /></div>} />
          <Route path="/checkout/entrega" element={<CheckoutEntrega />} />
          <Route path="/checkout/exito" element={<PagoExito />} />
          <Route path="/checkout/error" element={<PagoError />} />
          <Route path="/checkout/pendiente" element={<PagoPendiente />} />
          <Route path="/checkout/transferencia" element={<PagoTransferencia />} />
          <Route path="/checkout/transferencia-confirmada" element={<PagoTransferencia />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/grabados" element={<Grabados />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos" element={<TermsOfService />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen bg-bib-black flex items-center justify-center">
      <p className="text-bib-gray text-sm uppercase tracking-widest animate-pulse">Cargando módulo seguro...</p>
    </div>
  );
}

function App() {
  return (
    <GlobalErrorBoundary>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <AnalyticsTracker />
          <Routes>
            <Route path="/login" element={<Suspense fallback={<AdminLoadingFallback />}><Login /></Suspense>} />
            <Route path="/admin/carritos" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminCarritos /></Suspense></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminDashboard /></Suspense></ProtectedRoute>} />
            <Route path="*" element={<PublicRoutes />} />
          </Routes>
        </Router>
      </CartProvider>
    </GlobalErrorBoundary>
  );
}

export default App;