import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Star, MessageSquareText } from 'lucide-react';

export default function Opiniones() {
  const [resenas, setResenas] = useState([]);
  const [formData, setFormData] = useState({ customer_name: '', customer_email: '', rating: 5, comment: '' });
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

  return (
    <div className="max-w-4xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      <h1 className="text-3xl sm:text-4xl font-heading font-bold text-bib-white mb-2 text-center lowercase">opiniones</h1>
      {promedio && (
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={18} className={n <= Math.round(promedio) ? 'fill-bib-red text-bib-red' : 'text-bib-white/20'} />
            ))}
          </div>
          <span className="text-bib-gray text-sm">{promedio} / 5 ({resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'})</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-4">
          {resenas.length === 0 && (
            <div className="flex flex-col items-center gap-3 text-center py-12 sm:py-16 border border-dashed border-bib-white/10 rounded">
              <MessageSquareText size={32} className="text-bib-white/20" strokeWidth={1.25} />
              <p className="text-bib-white font-medium text-sm">Todavía no hay reseñas</p>
              <p className="text-bib-gray text-xs max-w-[220px]">Sé el primero en contar tu experiencia con {' '}
                <span className="text-bib-red">BIB Mates</span>
              </p>
            </div>
          )}
          {resenas.map((r) => (
            <div key={r.id} className="bg-bib-dark border border-bib-white/10 rounded p-5">
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
          ))}
        </div>

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
                className="w-full bg-bib-black border border-bib-white/20 rounded px-4 py-3 text-bib-white placeholder:text-bib-white/40 text-sm focus:outline-none focus:border-bib-red"
              />
              <input
                required
                type="email"
                placeholder="Tu email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="w-full bg-bib-black border border-bib-white/20 rounded px-4 py-3 text-bib-white placeholder:text-bib-white/40 text-sm focus:outline-none focus:border-bib-red"
              />
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setFormData({ ...formData, rating: n })}>
                    <Star size={22} className={n <= formData.rating ? 'fill-bib-red text-bib-red' : 'text-bib-white/20'} />
                  </button>
                ))}
              </div>
              <textarea
                required
                rows={4}
                placeholder="Contanos tu experiencia"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full bg-bib-black border border-bib-white/20 rounded px-4 py-3 text-bib-white placeholder:text-bib-white/40 text-sm resize-none focus:outline-none focus:border-bib-red"
              />
              {error && <p className="text-bib-red text-xs">{error}</p>}
              <button
                disabled={enviando}
                className="w-full bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black font-medium rounded px-6 py-3 uppercase tracking-widest text-xs transition-colors disabled:opacity-50"
              >
                {enviando ? 'Enviando...' : 'Enviar reseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}