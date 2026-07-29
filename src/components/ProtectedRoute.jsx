import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    let activo = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!activo) return;
      setAutorizado(!!data.session);
      setChecking(false);
    }
    checkSession();

    // Si la sesión cambia (ej: se cierra en otra pestaña), reacciona en el momento
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAutorizado(!!session);
    });

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-bib-black flex items-center justify-center">
        <p className="text-bib-gray text-sm uppercase tracking-widest">Verificando sesión...</p>
      </div>
    );
  }

  if (!autorizado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}