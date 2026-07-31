import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
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
import PagoExito from './components/PagoExito';
import PagoError from './components/PagoError';
import PagoPendiente from './components/PagoPendiente';
import NotFound from './components/NotFound';

// Componentes Administrativos — se cargan solo cuando alguien entra a /admin o /login,
// así el código pesado (recharts, formularios de admin) no viaja en el bundle público.
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));

function PublicRoutes() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-bib-black text-bib-white selection:bg-bib-red selection:text-bib-black">
      <Toaster position="bottom-right" richColors />
      <Navbar />
      <FloatingCart />
      <CartDrawer />

      <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
        <MessageCircle size={24} />
      </a>

      <main key={location.pathname} className="flex-grow animate-page-fade-in">
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
      <p className="text-bib-gray text-sm uppercase tracking-widest animate-pulse">Cargando...</p>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AnalyticsTracker />
        <Routes>
          {/* RUTAS ADMINISTRATIVAS */}
          <Route path="/login" element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <Login />
            </Suspense>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* RUTAS PÚBLICAS */}
          <Route path="*" element={<PublicRoutes />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;