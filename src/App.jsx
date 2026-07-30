import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Componentes Administrativos
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* RUTAS ADMINISTRATIVAS */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* RUTAS PÚBLICAS */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col font-sans bg-bib-black text-bib-white selection:bg-bib-red selection:text-bib-white">
              <Toaster position="bottom-right" richColors />
              <Navbar />
              <FloatingCart />
              <CartDrawer />

              <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="fixed bottom-24 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
                <MessageCircle size={24} />
              </a>

              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/cart" element={<div className="p-8 max-w-4xl mx-auto min-h-[60vh] mt-10"><CartPage /></div>} />
                  <Route path="/producto/:id" element={<div className="p-8 max-w-6xl mx-auto min-h-[60vh] mt-10"><ProductDetail /></div>} />
                  <Route path="/about" element={<div className="p-8 max-w-4xl mx-auto min-h-[60vh] mt-10"><About /></div>} />
                  <Route path="/opiniones" element={<div className="p-8 max-w-4xl mx-auto min-h-[60vh] mt-10"><Opiniones /></div>} />
                  <Route path="/checkout/entrega" element={<CheckoutEntrega />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;