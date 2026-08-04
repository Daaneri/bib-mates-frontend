import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X } from 'lucide-react';
import FadeIn from './FadeIn';
import SeoHead from './SeoHead';

export default function Grabados() {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  useEffect(() => {
    async function fetchGrabados() {
      const { data, error } = await supabase
        .from('grabados')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setImagenes(data || []);
      setLoading(false);
    }
    fetchGrabados();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12">
      <SeoHead
        title="Grabados"
        description="Galería de grabados personalizados realizados en mates."
        path="/grabados"
      />

      <div className="mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-bib-white tracking-tight mb-3">Grabados</h1>
        <p className="text-sm sm:text-base text-bib-gray max-w-xl mx-auto">
          Algunos de los trabajos de grabado personalizado que hicimos. ¿Querés uno para tu mate? Consultanos por WhatsApp.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded bg-bib-card animate-pulse" />
          ))}
        </div>
      ) : imagenes.length === 0 ? (
        <p className="text-center text-bib-gray py-16">Todavía no hay grabados cargados.</p>
      ) : (
        <FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {imagenes.map((img) => (
              <button
                key={img.id}
                onClick={() => setImagenAmpliada(img.image_url)}
                className="group aspect-square rounded overflow-hidden border border-bib-white/10 hover:border-bib-red/40 transition-all duration-300"
              >
                <img
                  src={img.image_url}
                  alt="Grabado realizado"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </button>
            ))}
          </div>
        </FadeIn>
      )}

      {imagenAmpliada && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImagenAmpliada(null)}
        >
          <button
            onClick={() => setImagenAmpliada(null)}
            className="absolute top-4 right-4 text-bib-white hover:text-bib-red transition-colors"
            aria-label="Cerrar"
          >
            <X size={28} />
          </button>
          <img
            src={imagenAmpliada}
            alt="Grabado ampliado"
            className="max-w-full max-h-full rounded object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}