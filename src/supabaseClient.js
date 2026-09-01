// Remueve '/api' al final de la URL si existe para evitar duplicar '/api/api/'
const BASE_URL = (import.meta.env.VITE_BACKEND_URL || "https://bib-mates-backend.onrender.com").replace(/\/api\/?$/, "");

export const supabase = {
  from: (tableName) => {
    const builder = {
      _params: new URLSearchParams(),
      _isSingle: false,

      select: function () { 
        return this; 
      },
      eq: function (col, val) { 
        if (val !== undefined && val !== null) {
          this._params.append(col, val); 
        }
        return this; 
      },
      neq: function (col, val) {
        if (val !== undefined && val !== null) {
          this._params.append(`${col}_neq`, val);
        }
        return this;
      },
      not: function (col, op, val) { 
        if (val !== undefined && val !== null) {
          this._params.append(`not_${col}`, val); 
        }
        return this; 
      },
      or: function (condition) { 
        if (condition) {
          this._params.append("or", condition); 
        }
        return this; 
      },
      single: function () {
        this._isSingle = true;
        return this;
      },
      order: function (col, { ascending = true } = {}) {
        this._params.append("sort", col);
        this._params.append("order", ascending ? "asc" : "desc");
        return this;
      },
      
      // Ejecución de la promesa al usar await
      then: async function (resolve, reject) {
        try {
          const queryString = this._params.toString();
          const url = `${BASE_URL}/api/${tableName}${queryString ? `?${queryString}` : ""}`;
          
          const res = await fetch(url);
          if (!res.ok) {
            return resolve({ 
              data: this._isSingle ? null : [], 
              error: `Error HTTP ${res.status}` 
            });
          }
          
          const data = await res.json();
          
          if (this._isSingle) {
            const singleData = Array.isArray(data) ? (data[0] || null) : data;
            return resolve({ data: singleData, error: null });
          }

          const cleanData = Array.isArray(data) ? data : (data ? [data] : []);
          resolve({ data: cleanData, error: null });
        } catch (err) {
          console.error(`Error consultando ${tableName}:`, err);
          resolve({ 
            data: this._isSingle ? null : [], 
            error: err.message 
          });
        }
      }
    };

    return builder;
  }
};