import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useFaqsModal } from '../context/FaqsModalContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://bib-mates-backend.onrender.com";

export default function FaqsModal() {
  const { open, closeModal } = useFaqsModal();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abierta, setAbierta] = useState(null);

  useEffect(() => {
    if (!open) return;

    async function fetchFaqs() {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/faqs`);
        const data = await res.json();
        if (res.ok) setFaqs(data);
      } catch (err) {
        console.error('Error cargando FAQs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
      onClick={closeModal}
    >
      <div
        className="bg-bib-dark border border-bib-white/10 rounded w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-bib-white/10 sticky top-0 bg-bib-dark">
          <h2 className="text-bib-white font-heading uppercase tracking-widest text-sm">
            Preguntas Frecuentes
          </h2>
          <button
            onClick={closeModal}
            className="text-bib-gray hover:text-bib-white transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <p className="text-bib-gray text-sm">Cargando preguntas...</p>
          ) : faqs.length === 0 ? (
            <p className="text-bib-gray text-sm">Todavía no hay preguntas frecuentes cargadas.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {faqs.map((faq) => {
                const isOpen = abierta === faq.id;
                return (
                  <div key={faq.id} className="border-b border-bib-white/10 pb-2">
                    <button
                      onClick={() => setAbierta(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between text-left py-2 text-bib-white text-sm font-medium"
                    >
                      {faq.question}
                      <ChevronDown
                        size={16}
                        className={`shrink-0 ml-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-bib-gray text-sm pb-2 whitespace-pre-wrap">{faq.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}