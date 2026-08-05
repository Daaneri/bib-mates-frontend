import React, { Suspense, lazy, Component } from 'react';
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

// Componentes Administrativos (Carga perezosa / Code Splitting)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));

/**
 * Componente ErrorBoundary para prevenir que errores en componentes lazy 
 * rompan toda la aplicación.
 */
class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Podés conectar un servicio de reporte de errores como Sentry aquí
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

  // Sanitizar el número de WhatsApp removiendo cualquier caracter que no sea número
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

      {/* Enlace seguro a WhatsApp con rel="noopener noreferrer nofollow" para prevenir Tabnabbing */}
      {cleanWhatsappNumber && (
        <a 
          href={`https://wa.me/${encodeURIComponent(cleanWhatsappNumber)}`} 
          target="_blank" 
          rel="noopener noreferrer nofollow"
          aria-label="Contactar por WhatsApp"
          className="fixed bottom-24 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
        >
          <MessageCircle size={24} />
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
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/grabados" element={<Grabados />} />
          
          {/* RUTAS LEGALES */}
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
          <AnalyticsTracker />
          <Routes>
            {/* RUTAS ADMINISTRATIVAS */}
            <Route 
              path="/login" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <Login />
                </Suspense>
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

            {/* RUTAS PÚBLICAS */}
            <Route path="*" element={<PublicRoutes />} />
          </Routes>
        </Router>
      </CartProvider>
    </GlobalErrorBoundary>
  );
}

export default App;