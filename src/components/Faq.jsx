import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronDown } from 'lucide-react';

export default function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const { data, error } = await supabase.from('faqs').select('*');
        if (error) throw error;
        if (data) setFaqs(data);
      } catch (error) {
        console.error('Error al cargar las preguntas:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-white min-h-[60vh]">
      <div className="text-center mb-10">
        <h2 className="text-[#C4A278] text-sm font-bold tracking-widest uppercase mb-2">Resolvé tus dudas</h2>
        <h1 className="text-3xl font-bold tracking-wider uppercase text-white">Preguntas Frecuentes</h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/50 animate-pulse text-sm uppercase tracking-widest">
          Cargando preguntas...
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 text-white/60 text-sm">
          No hay preguntas frecuentes registradas por el momento.
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={faq.id || index}
                className="border border-white/20 rounded-lg bg-[#121212] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium text-white hover:text-[#C4A278] transition-colors"
                >
                  <span className="text-base text-white">{faq.pregunta}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-[#C4A278] transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-sm text-gray-300 border-t border-white/10 leading-relaxed">
                    {faq.respuesta}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}