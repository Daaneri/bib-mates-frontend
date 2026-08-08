import React, { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://bib-mates-backend.onrender.com";

export default function AdminFaqs({ token }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/faqs`);
      const data = await res.json();
      if (res.ok) {
        setFaqs(data);
      } else {
        console.error("Error al obtener FAQs:", data.error);
      }
    } catch (err) {
      console.error("Error cargando FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/faqs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo crear la FAQ");
      }

      setSuccessMsg("¡FAQ creada con éxito!");
      setForm({ question: "", answer: "" });
      fetchFaqs();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const startEdit = (faq) => {
    setEditId(faq.id);
    setEditForm({ question: faq.question, answer: faq.answer });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ question: "", answer: "" });
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/faqs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        cancelEdit();
        fetchFaqs();
      }
    } catch (err) {
      console.error("Error editando FAQ:", err);
    }
  };

  const deleteFaq = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar esta pregunta?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/faqs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchFaqs();
      }
    } catch (err) {
      console.error("Error eliminando FAQ:", err);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", padding: "20px", textTransform: "none" }}>
      <h2 style={{ color: "#333", borderBottom: "2px solid #C4A278", paddingBottom: "8px", marginBottom: "20px" }}>
        Gestión de Preguntas Frecuentes
      </h2>

      {/* Formulario de creación */}
      <form onSubmit={handleSubmit} style={{ background: "#f9f9f9", padding: "24px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "32px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#444" }}>Agregar nueva pregunta</h3>

        {errorMsg && <p style={{ color: "#d9534f", backgroundColor: "#fdf7f7", padding: "10px", borderRadius: "4px", border: "1px solid #d9534f" }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: "#5cb85c", backgroundColor: "#f7fdf7", padding: "10px", borderRadius: "4px", border: "1px solid #5cb85c" }}>{successMsg}</p>}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
            Pregunta *
          </label>
          <input
            type="text"
            placeholder="Ej: ¿Cuánto tarda el envío?"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
            Respuesta *
          </label>
          <textarea
            placeholder="Ej: Entre 3 y 7 días hábiles según la zona."
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            required
            rows={3}
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: "16px",
            background: "#C4A278",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Guardar Pregunta
        </button>
      </form>

      {/* Listado */}
      <h3 style={{ color: "#444", marginBottom: "16px" }}>Preguntas Registradas</h3>
      {loading ? (
        <p>Cargando preguntas...</p>
      ) : faqs.length === 0 ? (
        <p style={{ color: "#666" }}>No hay preguntas frecuentes cargadas todavía.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((faq) => (
            <div key={faq.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "6px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {editId === faq.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input
                    type="text"
                    value={editForm.question}
                    onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontWeight: "bold" }}
                  />
                  <textarea
                    value={editForm.answer}
                    onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                    rows={3}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => saveEdit(faq.id)}
                      style={{ background: "#C4A278", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{ background: "#f0f0f0", color: "#333", border: "none", padding: "6px 14px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: "bold", margin: "0 0 6px 0" }}>{faq.question}</p>
                  <p style={{ color: "#555", margin: "0 0 12px 0", whiteSpace: "pre-wrap" }}>{faq.answer}</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => startEdit(faq)}
                      style={{ background: "#f0f0f0", color: "#333", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      style={{ background: "#d9534f", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}