import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    let activo = true;

    // Escuchar cambios de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (activo) {
        setAutorizado(!!session);
        setChecking(false);
      }
    });

    // Verificación de sesión inicial
    async function checkSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!activo) return;
        if (error || !session) {
          setAutorizado(false);
        } else {
          setAutorizado(true);
        }
      } catch (err) {
        if (activo) setAutorizado(false);
      } finally {
        if (activo) setChecking(false);
      }
    }

    checkSession();

    return () => {
      activo = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-bib-black flex items-center justify-center">
        <p className="text-bib-gray text-sm uppercase tracking-widest animate-pulse">
          Verificando sesión segura...
        </p>
      </div>
    );
  }

  if (!autorizado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}