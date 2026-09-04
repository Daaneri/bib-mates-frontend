import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { siteConfig } from '../config/site';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://bib-mates-backend.onrender.com";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Si ya existe un token guardado, redirigimos directo al admin
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin');
    } else {
      setCheckingSession(false);
    }
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'No se pudo iniciar sesión. Revisá el correo y la contraseña.');
      } else {
        // Guardamos el token que devuelve tu backend propio
        localStorage.setItem('token', data.token);
        toast.success('Sesión iniciada correctamente');
        navigate('/admin');
      }
    } catch (err) {
      console.error('Error de red al intentar iniciar sesión:', err);
      toast.error('Ocurrió un error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-bib-black flex items-center justify-center">
        <p className="text-bib-gray text-sm uppercase tracking-widest">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bib-black flex items-center justify-center p-4 font-sans">
      <form onSubmit={handleLogin} className="bg-bib-dark p-8 rounded border border-bib-white/10 w-full max-w-sm">
        <h2 className="text-lg font-heading font-bold mb-6 text-center text-bib-white lowercase">acceso administrador</h2>
        <p className="text-xs text-bib-gray text-center mb-6 uppercase tracking-widest">{siteConfig.businessName}</p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="CORREO"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bib-black p-3 rounded border border-bib-white/20 outline-none focus:border-bib-red text-bib-white placeholder:text-bib-gray text-sm tracking-widest"
            required
          />
          <input
            type="password"
            placeholder="CONTRASEÑA"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-bib-black p-3 rounded border border-bib-white/20 outline-none focus:border-bib-red text-bib-white placeholder:text-bib-gray text-sm tracking-widest"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bib-red text-bib-white font-medium py-3 rounded hover:bg-bib-white hover:text-bib-black transition uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}