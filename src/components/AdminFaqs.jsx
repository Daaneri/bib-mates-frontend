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
      <h2 className="text-base uppercase tracking-widest font-medium text-bib-white border-b border-[#C4A278] pb-2 mb-5">
        Gestión de Preguntas Frecuentes
      </h2>

      {/* Formulario de creación */}
      <form onSubmit={handleSubmit} className="bg-bib-black p-5 md:p-6 rounded border border-bib-white/10 space-y-4 mb-8">
        <h3 className="text-sm uppercase tracking-widest font-medium text-bib-white mb-1">Agregar nueva pregunta</h3>

        {errorMsg && (
          <p className="text-red-400 bg-red-900/20 border border-red-700/40 rounded px-3 py-2 text-sm">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="text-green-400 bg-green-900/20 border border-green-700/40 rounded px-3 py-2 text-sm">{successMsg}</p>
        )}

        <div>
          <label className="block mb-1.5 text-xs uppercase tracking-wide text-bib-gray">
            Pregunta *
          </label>
          <input
            type="text"
            placeholder="Ej: ¿Cuánto tarda el envío?"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            required
            className="w-full bg-bib-dark text-bib-white border border-bib-white/20 rounded p-3 text-sm outline-none focus:border-[#C4A278] placeholder:text-bib-gray/50"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-xs uppercase tracking-wide text-bib-gray">
            Respuesta *
          </label>
          <textarea
            placeholder="Ej: Entre 3 y 7 días hábiles según la zona."
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            required
            rows={3}
            className="w-full bg-bib-dark text-bib-white border border-bib-white/20 rounded p-3 text-sm outline-none focus:border-[#C4A278] placeholder:text-bib-gray/50"
          />
        </div>

        <button
          type="submit"
          className="bg-[#C4A278] hover:bg-bib-white text-bib-black px-6 py-3 rounded font-bold text-xs uppercase tracking-widest transition-colors"
        >
          Guardar Pregunta
        </button>
      </form>

      {/* Listado */}
      <h3 className="text-sm uppercase tracking-widest font-medium text-bib-white mb-4">Preguntas Registradas</h3>
      {loading ? (
        <p className="text-bib-gray text-sm">Cargando preguntas...</p>
      ) : faqs.length === 0 ? (
        <p className="text-bib-gray text-sm">No hay preguntas frecuentes cargadas todavía.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-bib-black border border-bib-white/10 rounded p-4">
              {editId === faq.id ? (
                <div className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    value={editForm.question}
                    onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                    className="w-full bg-bib-dark text-bib-white border border-bib-white/20 rounded p-2.5 text-sm font-bold outline-none focus:border-[#C4A278]"
                  />
                  <textarea
                    value={editForm.answer}
                    onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                    rows={3}
                    className="w-full bg-bib-dark text-bib-white border border-bib-white/20 rounded p-2.5 text-sm outline-none focus:border-[#C4A278]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(faq.id)}
                      className="bg-[#C4A278] hover:bg-bib-white text-bib-black px-3.5 py-1.5 rounded text-xs font-bold transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-bib-dark hover:bg-bib-white text-bib-white hover:text-bib-black border border-bib-white/20 px-3.5 py-1.5 rounded text-xs transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-bold text-bib-white mb-1.5">{faq.question}</p>
                  <p className="text-bib-gray text-sm mb-3 whitespace-pre-wrap">{faq.answer}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(faq)}
                      className="bg-bib-dark hover:bg-bib-white text-bib-white hover:text-bib-black border border-bib-white/20 px-3 py-1.5 rounded text-xs transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="bg-red-900/40 hover:bg-red-700 text-red-300 hover:text-white px-3 py-1.5 rounded text-xs transition-colors"
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