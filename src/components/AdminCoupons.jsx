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

  // Obtener todos los cupones
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

  // Crear un nuevo cupón
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

  // Activar o desactivar cupón
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

  // Eliminar cupón
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
    <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ color: "#333", borderBottom: "2px solid #C4A278", paddingBottom: "8px", marginBottom: "20px" }}>
        Gestión de Cupones de Descuento
      </h2>

      {/* Formulario de creación */}
      <form onSubmit={handleSubmit} style={{ background: "#f9f9f9", padding: "24px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "32px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#444" }}>Crear nuevo cupón</h3>
        
        {errorMsg && <p style={{ color: "#d9534f", backgroundColor: "#fdf7f7", padding: "10px", borderRadius: "4px", border: "1px solid #d9534f" }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: "#5cb85c", backgroundColor: "#f7fdf7", padding: "10px", borderRadius: "4px", border: "1px solid #5cb85c" }}>{successMsg}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
              Código del cupón *
            </label>
            <input
              type="text"
              placeholder="Ej: VERANO10"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
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
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
              Límite de uso (Opcional)
            </label>
            <input
              type="number"
              min="1"
              placeholder="Ej: 50 (vacío = sin límite)"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
              Fecha vencimiento (Opcional)
            </label>
            <input
              type="date"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: "20px",
            background: "#C4A278",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.2s ease"
          }}
        >
          Guardar Cupón
        </button>
      </form>

      {/* Listado de Cupones */}
      <h3 style={{ color: "#444", marginBottom: "16px" }}>Cupones Registrados</h3>
      {loading ? (
        <p>Cargando lista de cupones...</p>
      ) : coupons.length === 0 ? (
        <p style={{ color: "#666" }}>No hay cupones creados por el momento.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ background: "#f2f2f2", textAlign: "left", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "12px" }}>Código</th>
                <th style={{ padding: "12px" }}>Descuento</th>
                <th style={{ padding: "12px" }}>Usos</th>
                <th style={{ padding: "12px" }}>Vencimiento</th>
                <th style={{ padding: "12px" }}>Estado</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", fontWeight: "bold", letterSpacing: "0.5px" }}>{c.code}</td>
                  <td style={{ padding: "12px" }}>{c.discount_percentage}%</td>
                  <td style={{ padding: "12px" }}>{c.current_uses || 0} / {c.max_uses || "∞"}</td>
                  <td style={{ padding: "12px" }}>
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("es-AR") : "Sin límite"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: c.is_active ? "#e6f4ea" : "#fce8e6",
                        color: c.is_active ? "#137333" : "#c5221f"
                      }}
                    >
                      {c.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                      <button
                        onClick={() => toggleStatus(c.id, c.is_active)}
                        style={{
                          background: c.is_active ? "#f0f0f0" : "#C4A278",
                          color: c.is_active ? "#333" : "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "13px"
                        }}
                      >
                        {c.is_active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => deleteCoupon(c.id, c.code)}
                        style={{
                          background: "#d9534f",
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "13px"
                        }}
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