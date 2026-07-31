import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Como BIB Mates es una SPA (no hay recarga real de página al navegar),
 * Google Analytics no detecta los cambios de ruta solo. Este componente
 * avisa manualmente cada vez que cambia la URL.
 */
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return null;
}