import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Star, MessageSquareText } from 'lucide-react';
import FadeIn from './FadeIn';
import SeoHead from './SeoHead';

export default function Opiniones() {
  const [resenas, setResenas] = useState([]);
  const [formData, setFormData] = useState({ customer_name: '', customer_email: '', rating: 5, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResenas();
  }, []);

  async function fetchResenas() {
    const { data } = await supabase
      .from('resenas')
      .select('*')
      .eq('aprobado', true)
      .order('created_at', { ascending: false });
    setResenas(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const { error } = await supabase.from('resenas').insert([{
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      rating: formData.rating,
      comment: formData.comment,
    }]);

    if (error) {
      setError('No pudimos enviar tu reseña. Probá de nuevo.');
    } else {
      setEnviado(true);
      setFormData({ customer_name: '', customer_email: '', rating: 5, comment: '' });
    }
    setEnviando(false);
  }

  const promedio = resenas.length > 0
    ? (resenas.reduce((sum, r) => sum + r.rating, 0) / resenas.length).toFixed(1)
    : null;

  // Solo generamos el dato estructurado de reseñas si hay al menos una — Google
  // rechaza (o directamente ignora) un AggregateRating sin reviews reales atrás.
  const reviewsJsonLd = promedio ? {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BIB Mates",
    url: "https://bib-mates-frontend.vercel.app/",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: promedio,
      reviewCount: resenas.length,
    },
    review: resenas.slice(0, 10).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.customer_name },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.comment,
    })),
  } : null;

  return (
    <div className="max-w-4xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      <SeoHead
        title="Opiniones"
        description="Mirá lo que dicen nuestros clientes sobre BIB Mates y dejá tu propia reseña."
        path="/opiniones"
        jsonLd={reviewsJsonLd}
      />
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-bib-white mb-2 text-center lowercase">opiniones</h1>
      </FadeIn>

      {promedio && (
        <FadeIn delay={80}>
          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={18} className={n <= Math.round(promedio) ? 'fill-bib-red text-bib-red' : 'text-bib-white/20'} />
              ))}
            </div>
            <span className="text-bib-gray text-sm">{promedio} / 5 ({resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'})</span>
          </div>
        </FadeIn>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-4">
          {resenas.length === 0 && (
            <FadeIn>
              <div className="flex flex-col items-center gap-3 text-center py-12 text-bib-gray">
                <MessageSquareText size={28} strokeWidth={1.25} className="text-bib-white/20" />
                <p className="text-sm max-w-xs">Todavía no hay reseñas publicadas. ¡Sé el primero en dejar una!</p>
              </div>
            </FadeIn>
          )}
          {resenas.map((r, i) => (
            <FadeIn key={r.id} delay={i * 60}>
              <div className="bg-bib-dark border border-bib-white/10 rounded p-5 transition-colors duration-300 hover:border-bib-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-bib-white text-sm">{r.customer_name}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={14} className={n <= r.rating ? 'fill-bib-red text-bib-red' : 'text-bib-white/20'} />
                    ))}
                  </div>
                </div>
                <p className="text-bib-gray text-sm leading-relaxed">{r.comment}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={120}>
          <div className="bg-bib-dark border border-bib-white/10 rounded p-5 sm:p-8 h-fit">
            <h2 className="text-sm font-medium text-bib-white uppercase tracking-widest mb-4">Dejá tu reseña</h2>

            {enviado ? (
              <p className="text-bib-red text-sm leading-relaxed">
                ¡Gracias! Tu reseña quedó pendiente de aprobación y se va a publicar pronto.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  required
                  placeholder="Tu nombre"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full bg-bib-black border border-bib-white/20 rounded px-4 py-3 text-bib-white placeholder:text-bib-white/40 text-sm focus:outline-none focus:border-bib-red transition-colors"
                />
                <input
                  required
                  type="email"
                  placeholder="Tu email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full bg-bib-black border border-bib-white/20 rounded px-4 py-3 text-bib-white placeholder:text-bib-white/40 text-sm focus:outline-none focus:border-bib-red transition-colors"
                />
                <div className="flex items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onMouseEnter={() => setHoverRating(n)}
                      onClick={() => setFormData({ ...formData, rating: n })}
                      className="transition-transform duration-150 hover:scale-125"
                    >
                      <Star size={22} className={n <= (hoverRating || formData.rating) ? 'fill-bib-red text-bib-red' : 'text-bib-white/20'} />
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Contanos tu experiencia"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full bg-bib-black border border-bib-white/20 rounded px-4 py-3 text-bib-white placeholder:text-bib-white/40 text-sm resize-none focus:outline-none focus:border-bib-red transition-colors"
                />
                {error && <p className="text-bib-red text-xs">{error}</p>}
                <button
                  disabled={enviando}
                  className="w-full bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black font-medium rounded px-6 py-3 uppercase tracking-widest text-xs transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(196,162,120,0.3)]"
                >
                  {enviando ? 'Enviando...' : 'Enviar reseña'}
                </button>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}