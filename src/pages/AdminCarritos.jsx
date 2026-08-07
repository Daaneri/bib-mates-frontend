import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { generarLinkRecuperacionWhatsApp } from '../utils/whatsapp';
import { MessageCircle, CheckCircle } from 'lucide-react';

export default function AdminCarritos() {
  const [carritos, setCarritos] = useState([]);

  useEffect(() => {
    cargarCarritos();
  }, []);

  async function cargarCarritos() {
    const { data } = await supabase
      .from('carritos_abandonados')
      .select('*')
      .eq('recuperado', false)
      .order('created_at', { ascending: false });
    
    setCarritos(data || []);
  }

  const marcarComoAtendido = async (id) => {
    await supabase.from('carritos_abandonados').update({ recuperado: true }).eq('id', id);
    cargarCarritos();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-bib-white space-y-6">
      <h1 className="text-2xl font-bold font-heading">Carritos Pendientes de Recuperación</h1>

      <div className="space-y-4">
        {carritos.map((c) => {
          const linkWA = generarLinkRecuperacionWhatsApp ? generarLinkRecuperacionWhatsApp({
            telefono: c.cliente_telefono,
            nombre: c.cliente_nombre,
            items: c.items,
            montoTotal: c.monto_total
          }) : '#';

          return (
            <div key={c.id} className="bg-bib-dark border border-bib-white/10 p-5 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{c.cliente_nombre}</span>
                  <span className="text-xs text-bib-gray">({c.cliente_telefono})</span>
                </div>
                <p className="text-xs text-bib-gray">
                  Fecha: {new Date(c.created_at).toLocaleString('es-AR')}
                </p>
                <div className="text-xs text-[#C4A278] pt-1">
                  {c.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={linkWA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-xs font-bold uppercase transition-colors"
                >
                  <MessageCircle size={16} />
                  Enviar WhatsApp
                </a>
                <button
                  onClick={() => marcarComoAtendido(c.id)}
                  className="p-2 border border-bib-white/20 rounded hover:bg-bib-white/10 text-bib-gray hover:text-bib-white transition-colors"
                  title="Marcar como atendido"
                >
                  <CheckCircle size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}