import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { siteConfig } from '../config/site';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      navigate('/admin');
    }
    setLoading(false);
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
            className="w-full bg-bib-red text-bib-white font-medium py-3 rounded hover:bg-bib-white hover:text-bib-black transition uppercase tracking-widest text-sm"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}