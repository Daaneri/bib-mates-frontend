import React, { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://bib-mates-backend.onrender.com";

export default function AdminCoupons({ token }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    discount_percentage: "",
    max_uses: "",
    expires_at: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons(data);
      } else {
        console.error("Error al obtener cupones:", data.error);
      }
    } catch (err) {
      console.error("Error cargando cupones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCoupons();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo crear el cupón");
      }

      setSuccessMsg(`¡Cupón "${data.code}" creado con éxito!`);
      setForm({ code: "", discount_percentage: "", max_uses: "", expires_at: "" });
      fetchCoupons();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/coupons/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error("Error cambiando estado del cupón:", err);
    }
  };

  const deleteCoupon = async (id, code) => {
    if (!window.confirm(`¿Seguro que querés eliminar el cupón "${code}"?`)) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error("Error eliminando cupón:", err);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", padding: "20px", textTransform: "none" }}>
      <h2 className="text-base uppercase tracking-widest font-medium text-bib-white border-b border-[#C4A278] pb-2 mb-5">
        Gestión de Cupones de Descuento
      </h2>

      {/* Formulario de creación */}
      <form onSubmit={handleSubmit} className="bg-bib-black p-5 md:p-6 rounded border border-bib-white/10 space-y-4 mb-8">
        <h3 className="text-sm uppercase tracking-widest font-medium text-bib-white mb-1">Crear nuevo cupón</h3>

        {errorMsg && (
          <p className="text-red-400 bg-red-900/20 border border-red-700/40 rounded px-3 py-2 text-sm">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="text-green-400 bg-green-900/20 border border-green-700/40 rounded px-3 py-2 text-sm">{successMsg}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-xs uppercase tracking-wide text-bib-gray">
              Código del cupón *
            </label>
            <input
              type="text"
              placeholder="Ej: VERANO10"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
              className="w-full bg-bib-dark text-bib-white border border-bib-white/20 rounded p-3 text-sm outline-none focus:border-[#C4A278] placeholder:text-bib-gray/50"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs uppercase tracking-wide text-bib-gray">
              Descuento (%) *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              placeholder="Ej: 15"
              value={form.discount_percentage}
              onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })}
              required
              className="w-full bg-bib-dark text-bib-white border border-bib-white/20 rounded p-3 text-sm outline-none focus:border-[#C4A278] placeholder:text-bib-gray/50"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs uppercase tracking-wide text-bib-gray">
              Límite de uso (Opcional)
            </label>
            <input
              type="number"
              min="1"
              placeholder="Ej: 50 (vacío = sin límite)"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              className="w-full bg-bib-dark text-bib-white border border-bib-white/20 rounded p-3 text-sm outline-none focus:border-[#C4A278] placeholder:text-bib-gray/50"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs uppercase tracking-wide text-bib-gray">
              Fecha vencimiento (Opcional)
            </label>
            <input
              type="date"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              className="w-full bg-bib-dark text-bib-white border border-bib-white/20 rounded p-3 text-sm outline-none focus:border-[#C4A278]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-[#C4A278] hover:bg-bib-white text-bib-black px-6 py-3 rounded font-bold text-xs uppercase tracking-widest transition-colors"
        >
          Guardar Cupón
        </button>
      </form>

      {/* Listado de Cupones */}
      <h3 className="text-sm uppercase tracking-widest font-medium text-bib-white mb-4">Cupones Registrados</h3>
      {loading ? (
        <p className="text-bib-gray text-sm">Cargando lista de cupones...</p>
      ) : coupons.length === 0 ? (
        <p className="text-bib-gray text-sm">No hay cupones creados por el momento.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-bib-black rounded overflow-hidden text-sm">
            <thead>
              <tr className="bg-bib-dark text-left border-b border-bib-white/10">
                <th className="p-3 text-bib-gray text-xs uppercase tracking-wide">Código</th>
                <th className="p-3 text-bib-gray text-xs uppercase tracking-wide">Descuento</th>
                <th className="p-3 text-bib-gray text-xs uppercase tracking-wide">Usos</th>
                <th className="p-3 text-bib-gray text-xs uppercase tracking-wide">Vencimiento</th>
                <th className="p-3 text-bib-gray text-xs uppercase tracking-wide">Estado</th>
                <th className="p-3 text-bib-gray text-xs uppercase tracking-wide text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-bib-white/5">
                  <td className="p-3 font-bold tracking-wide text-bib-white">{c.code}</td>
                  <td className="p-3 text-bib-white">{c.discount_percentage}%</td>
                  <td className="p-3 text-bib-white">{c.current_uses || 0} / {c.max_uses || "∞"}</td>
                  <td className="p-3 text-bib-white">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("es-AR") : "Sin límite"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-bold ${
                        c.is_active
                          ? "bg-green-900/30 text-green-400"
                          : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {c.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => toggleStatus(c.id, c.is_active)}
                        className={`px-3 py-1.5 rounded text-xs transition-colors ${
                          c.is_active
                            ? "bg-bib-dark text-bib-white hover:bg-bib-white hover:text-bib-black"
                            : "bg-[#C4A278] text-bib-black hover:bg-bib-white"
                        }`}
                      >
                        {c.is_active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => deleteCoupon(c.id, c.code)}
                        className="px-3 py-1.5 rounded text-xs bg-red-900/40 text-red-300 hover:bg-red-700 hover:text-white transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}