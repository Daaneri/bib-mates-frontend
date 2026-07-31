// src/components/CookieBanner.jsx
import { useState, useEffect } from 'react';
import { initGA } from '../utils/analytics';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('bib_cookie_consent');
    if (!consent) {
      setShow(true);
    } else if (consent === 'accepted') {
      initGA();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('bib_cookie_consent', 'accepted');
    setShow(false);
    initGA();
  };

  const handleReject = () => {
    localStorage.setItem('bib_cookie_consent', 'rejected');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-auto md:right-6 md:max-w-md z-50 bg-[#161616] border border-bib-white/10 text-bib-white p-5 rounded-2xl shadow-2xl flex flex-col gap-3 backdrop-blur-md bg-opacity-95 animate-page-fade-in">
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-bold uppercase tracking-wider text-bib-white">Privacidad y Cookies</h4>
        <p className="text-xs text-bib-gray leading-relaxed">
          Utilizamos cookies propias y de terceros (Google Analytics) para mejorar tu experiencia. Conoce los detalles en nuestra <Link to="/privacidad" className="underline text-bib-white hover:text-bib-red transition-colors">Política de Privacidad</Link>.
        </p>
      </div>
      <div className="flex items-center gap-2 justify-end pt-1">
        <button
          onClick={handleReject}
          className="px-4 py-2 text-xs font-medium text-bib-gray hover:text-bib-white transition-colors"
        >
          Rechazar
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-bib-white text-bib-black rounded-xl hover:bg-bib-red hover:text-bib-white transition-all duration-300"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}