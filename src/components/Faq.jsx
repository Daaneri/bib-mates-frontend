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
        // Trae todas las preguntas de la tabla 'faqs' en Supabase
        const { data, error } = await supabase.from('faqs').select('*');
        if (error) throw error;
        if (data) setFaqs(data);
      } catch (error) {
        console.error('Error al cargar las FAQs:', error);
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
    <div className="max-w-3xl mx-auto py-12 px-4 text-bib-white min-h-[60vh]">
      <div className="text-center mb-10">
        <h2 className="text-bib-gold text-sm font-bold tracking-widest uppercase mb-2">Resolvé tus dudas</h2>
        <h1 className="text-3xl font-bold tracking-wider uppercase">Preguntas Frecuentes</h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-bib-white/50 animate-pulse">Cargando...</div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={faq.id}
              className="border border-bib-white/10 rounded-lg bg-bib-black overflow-hidden"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-4 text-left font-medium hover:text-[#C4A278] transition-colors"
              >
                <span>{faq.pregunta}</span>
                <ChevronDown 
                  size={20} 
                  className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                />
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 pt-1 text-bib-white/70 border-t border-bib-white/5 leading-relaxed">
                  {faq.respuesta}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}