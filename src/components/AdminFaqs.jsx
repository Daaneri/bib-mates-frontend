import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Trash2, Edit, Plus } from 'lucide-react';

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    const { data, error } = await supabase.from('faqs').select('*').order('id', { ascending: true });
    if (!error) setFaqs(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!question || !answer) return;

    if (editingId) {
      // Editar pregunta existente
      await supabase.from('faqs').update({ question, answer }).eq('id', editingId);
      setEditingId(null);
    } else {
      // Crear nueva pregunta
      await supabase.from('faqs').insert([{ question, answer }]);
    }

    setQuestion('');
    setAnswer('');
    fetchFaqs();
  }

  async function handleEdit(faq) {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  }

  async function handleDelete(id) {
    if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
      await supabase.from('faqs').delete().eq('id', id);
      fetchFaqs();
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-bib-white">
      <h2 className="text-2xl font-bold mb-6 text-[#C4A278]">Gestión de Preguntas Frecuentes</h2>

      {/* Formulario de Carga / Edición */}
      <form onSubmit={handleSubmit} className="bg-bib-black/60 border border-bib-white/10 p-6 rounded-lg mb-8 space-y-4">
        <h3 className="text-lg font-semibold">{editingId ? 'Editar Pregunta' : 'Agregar Nueva Pregunta'}</h3>
        <div>
          <label className="block text-xs uppercase tracking-wider mb-1 text-bib-gray">Pregunta</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-bib-black border border-bib-white/20 rounded p-2.5 text-bib-white focus:border-[#C4A278] outline-none"
            placeholder="Ej: ¿Cómo se curan los mates?"
            required
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider mb-1 text-bib-gray">Respuesta</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full bg-bib-black border border-bib-white/20 rounded p-2.5 text-bib-white focus:border-[#C4A278] outline-none"
            placeholder="Escribe la respuesta detallada..."
            rows="3"
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-[#C4A278] text-bib-black px-6 py-2 rounded font-bold text-xs tracking-widest uppercase hover:bg-bib-white transition-all"
          >
            {editingId ? 'Actualizar Pregunta' : 'Guardar Pregunta'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setQuestion(''); setAnswer(''); }}
              className="bg-transparent border border-bib-white/20 text-bib-white px-4 py-2 rounded text-xs uppercase"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Listado de Preguntas Guardadas */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="flex items-center justify-between bg-bib-black/40 border border-bib-white/10 p-4 rounded-lg">
            <div>
              <p className="font-semibold text-bib-white">{faq.question}</p>
              <p className="text-xs text-bib-gray mt-1 line-clamp-2">{faq.answer}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button onClick={() => handleEdit(faq)} className="p-2 text-[#C4A278] hover:bg-bib-white/5 rounded">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(faq.id)} className="p-2 text-red-400 hover:bg-bib-white/5 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}