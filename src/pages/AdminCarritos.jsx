import { useEffect, useState } from 'react';
import { generarLinkRecuperacionWhatsApp } from '../utils/whatsapp';
import { MessageCircle, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminCarritos({ token, apiUrl }) {
  const API_URL = apiUrl || import.meta.env.VITE_API_URL || "http://localhost:3001";
  const [carritos, setCarritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [verAtendidos, setVerAtendidos] = useState(false);

  useEffect(() => {
    cargarCarritos();
  }, [verAtendidos]);

  async function cargarCarritos() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/carritos_abandonados?recuperado=${verAtendidos}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`);
      }

      const data = await res.json();
      setCarritos(data || []);
    } catch (err) {
      console.error("Error al cargar carritos:", err);
      setErrorMsg(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  const marcarComoAtendido = async (id, estadoActual) => {
    try {
      const res = await fetch(`${API_URL}/api/carritos_abandonados/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recuperado: !estadoActual })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error HTTP ${res.status}`);
      }

      cargarCarritos();
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto text-bib-white space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bib-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading">Carritos de Recuperación</h1>
          <p className="text-xs text-bib-gray mt-1">
            {verAtendidos ? 'Mostrando carritos ya recuperados/atendidos' : 'Mostrando carritos pendientes de contacto'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVerAtendidos(!verAtendidos)}
            className="px-3 py-1.5 rounded text-xs border border-bib-white/20 hover:border-bib-red transition text-bib-gray hover:text-bib-white"
          >
            {verAtendidos ? '← Ver Pendientes' : 'Ver Atendidos'}
          </button>
          <button
            onClick={cargarCarritos}
            className="p-2 border border-bib-white/20 rounded hover:border-bib-white text-bib-gray hover:text-bib-white transition-colors"
            title="Recargar"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-900/30 border border-red-500/50 p-4 rounded text-red-200 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>Error: {errorMsg}. Comprobá que la tabla 'carritos_abandonados' exista en Neon y que el backend esté corriendo.</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-bib-gray text-sm">
          Cargando carritos...
        </div>
      ) : carritos.length === 0 ? (
        <div className="bg-bib-dark p-8 rounded border border-bib-white/10 text-center text-bib-gray text-sm">
          {verAtendidos ? 'No hay carritos marcados como recuperados.' : 'No hay carritos pendientes por recuperar.'}
        </div>
      ) : (
        <div className="space-y-4">
          {carritos.map((c) => {
            const linkWA = typeof generarLinkRecuperacionWhatsApp === 'function' ? generarLinkRecuperacionWhatsApp({
              telefono: c.cliente_telefono,
              nombre: c.cliente_nombre,
              items: c.items,
              montoTotal: c.monto_total
            }) : '#';

            return (
              <div key={c.id} className="bg-bib-dark border border-bib-white/10 p-5 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg">{c.cliente_nombre || 'Sin Nombre'}</span>
                    <span className="text-xs text-bib-gray">({c.cliente_telefono || 'Sin Teléfono'})</span>
                  </div>
                  <p className="text-xs text-bib-gray">
                    Fecha: {c.created_at ? new Date(c.created_at).toLocaleString('es-AR') : 'N/A'}
                  </p>
                  <div className="text-xs text-[#C4A278] pt-1 font-medium">
                    {Array.isArray(c.items) && c.items.length > 0
                      ? c.items.map(i => `${i.name || i.nombre} (x${i.quantity || i.cantidad || 1})`).join(', ')
                      : 'Sin productos registrados'}
                  </div>
                  {c.monto_total && (
                    <div className="text-xs text-bib-white font-bold pt-0.5">
                      Total: ${Number(c.monto_total).toLocaleString('es-AR')}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {c.cliente_telefono && (
                    <a
                      href={linkWA}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-xs font-bold uppercase transition-colors"
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => marcarComoAtendido(c.id, c.recuperado)}
                    className={`p-2 border rounded transition-colors ${
                      c.recuperado 
                        ? 'border-green-500/50 bg-green-500/20 text-green-400' 
                        : 'border-bib-white/20 hover:bg-bib-white/10 text-bib-gray hover:text-bib-white'
                    }`}
                    title={c.recuperado ? "Marcar como pendiente" : "Marcar como atendido"}
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}