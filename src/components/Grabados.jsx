import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, ZoomIn, MessageCircle } from 'lucide-react';
import FadeIn from './FadeIn';
import SeoHead from './SeoHead';

const WHATSAPP_NUMBER = "5491172556427"; // Número de WhatsApp para consultas

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

  const handleConsultarWhatsApp = (imageUrl) => {
    const message = encodeURIComponent(
      `¡Hola! Vi este grabado en la web y me gustaría consultar por uno así: ${imageUrl}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  // Función para asignar patrones de tamaño (Mosaico estilo la imagen)
  const getTileClasses = (index) => {
    const pattern = index % 8;
    switch (pattern) {
      case 0:
        return 'col-span-2 row-span-2 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[360px]'; // Bloque Grande Violeta
      case 1:
        return 'col-span-1 row-span-2 md:col-span-1 md:row-span-2 min-h-[280px] md:min-h-[360px]'; // Vertical Verde
      case 2:
        return 'col-span-1 row-span-1 min-h-[140px] md:min-h-[170px]'; // Rectángulo Chico Azul
      case 3:
        return 'col-span-1 row-span-1 md:col-span-2 min-h-[140px] md:min-h-[170px]'; // Horizontal Ancho Verde
      case 4:
        return 'col-span-1 row-span-2 md:col-span-1 md:row-span-2 min-h-[280px] md:min-h-[360px]'; // Vertical Naranja
      case 5:
        return 'col-span-2 row-span-2 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[360px]'; // Bloque Grande
      case 6:
        return 'col-span-1 row-span-1 min-h-[140px] md:min-h-[170px]'; // Cuadrado Chico
      case 7:
        return 'col-span-2 row-span-1 min-h-[140px] md:min-h-[170px]'; // Horizontal Largo
      default:
        return 'col-span-1 row-span-1 min-h-[180px]';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12">
      <SeoHead
        title="Grabados"
        description="Galería de grabados personalizados realizados en mates y termos."
        path="/grabados"
      />

      <div className="mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-bib-white tracking-tight mb-3">
          GRABADOS
        </h1>
        <p className="text-sm sm:text-base text-bib-gray max-w-xl mx-auto">
          Algunos de los trabajos de grabado personalizado que hicimos. ¿Querés uno para tu mate o termo? Consultanos por WhatsApp.
        </p>
        <div className="w-16 h-1 bg-bib-red mx-auto mt-4 rounded-full" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[140px] md:auto-rows-[170px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl bg-bib-card animate-pulse ${getTileClasses(i)}`}
            />
          ))}
        </div>
      ) : imagenes.length === 0 ? (
        <p className="text-center text-bib-gray py-16">Todavía no hay grabados cargados.</p>
      ) : (
        <FadeIn>
          {/* Grilla Mosaico Dinámica */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[140px] md:auto-rows-[170px] grid-flow-dense">
            {imagenes.map((img, index) => (
              <div
                key={img.id}
                onClick={() => setImagenAmpliada(img.image_url)}
                className={`group relative cursor-pointer rounded-2xl overflow-hidden border border-bib-white/10 bg-bib-card hover:border-bib-red/50 transition-all duration-300 hover:shadow-xl hover:shadow-bib-red/10 ${getTileClasses(index)}`}
              >
                <img
                  src={img.image_url}
                  alt="Grabado realizado"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay al pasar el mouse */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-black/60 text-bib-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                    <ZoomIn size={14} /> Ampliar
                  </span>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Modal Lightbox */}
      {imagenAmpliada && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setImagenAmpliada(null)}
        >
          <button
            onClick={() => setImagenAmpliada(null)}
            className="absolute top-4 right-4 text-bib-white hover:text-bib-red transition-colors p-2 rounded-full bg-black/40"
            aria-label="Cerrar"
          >
            <X size={26} />
          </button>

          <div
            className="relative max-w-full max-h-[85vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imagenAmpliada}
              alt="Grabado ampliado"
              className="max-w-full max-h-[75vh] rounded-xl object-contain shadow-2xl border border-white/10"
            />

            <button
              onClick={() => handleConsultarWhatsApp(imagenAmpliada)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all duration-300 shadow-lg active:scale-95"
            >
              <MessageCircle size={18} />
              Consultar por este grabado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}