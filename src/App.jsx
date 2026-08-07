import React, { Suspense, lazy, Component, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
import CheckoutEntrega from './components/CheckoutEntrega';
import { siteConfig } from './config/site';

// Componentes Públicos
import Navbar from './components/Navbar';
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

// Componente para forzar el scroll arriba en cada cambio de ruta
function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado en ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bib-black text-bib-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Ocurrió un problema temporal</h2>
          <p className="text-bib-gray text-sm mb-4">Por favor recargá la página para continuar.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-bib-red text-bib-white px-4 py-2 rounded font-semibold hover:opacity-90 transition-opacity"
          >
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

  const cleanWhatsappNumber = siteConfig?.whatsapp 
    ? String(siteConfig.whatsapp).replace(/[^0-9]/g, '') 
    : '';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-bib-black text-bib-white selection:bg-bib-red selection:text-bib-black">
      <Toaster position="bottom-right" richColors />
      <Navbar />
      <FloatingCart />
      <CartDrawer />
      <CookieBanner />

      {/* Enlace flotante a WhatsApp posicionado verticalmente sobre el carrito */}
      {cleanWhatsappNumber && (
        <a 
          href={`https://wa.me/${encodeURIComponent(cleanWhatsappNumber)}`} 
          target="_blank" 
          rel="noopener noreferrer nofollow"
          aria-label="Contactar por WhatsApp"
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 bg-[#25D366] text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 flex items-center justify-center"
        >
          <MessageCircle size={20} className="sm:hidden" />
          <MessageCircle size={24} className="hidden sm:block" />
        </a>
      )}

      <main key={encodeURIComponent(location.pathname)} className="flex-grow animate-page-fade-in">
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
            <Route 
              path="/login" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <Login />
                </Suspense>
              } 
            />
            <Route 
              path="/admin/carritos" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <AdminCarritos />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <AdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<PublicRoutes />} />
          </Routes>
        </Router>
      </CartProvider>
    </GlobalErrorBoundary>
  );
}

export default App;