import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está definida en el archivo .env');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Parser de CSV que respeta comillas escapadas ("" dentro de un campo entre comillas)
function dividirLinea(linea) {
  const campos = [];
  let campoActual = '';
  let dentroDeComillas = false;

  for (let i = 0; i < linea.length; i++) {
    const char = linea[i];
    if (char === '"') {
      if (dentroDeComillas && linea[i + 1] === '"') {
        campoActual += '"';
        i++; // saltar la segunda comilla del par escapado
      } else {
        dentroDeComillas = !dentroDeComillas;
      }
    } else if (char === ',' && !dentroDeComillas) {
      campos.push(campoActual);
      campoActual = '';
    } else {
      campoActual += char;
    }
  }
  campos.push(campoActual);
  return campos;
}

function parsearCSV(contenido) {
  const lineas = contenido.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lineas.length === 0) return [];

  const headers = dividirLinea(lineas[0]);
  const resultados = [];

  for (let i = 1; i < lineas.length; i++) {
    const campos = dividirLinea(lineas[i]);
    const fila = {};
    headers.forEach((h, idx) => {
      fila[h] = campos[idx] !== undefined ? campos[idx] : '';
    });
    resultados.push(fila);
  }
  return resultados;
}

function toBool(v) {
  return String(v).trim().toLowerCase() === 'true';
}

function toNumberOrZero(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function importar() {
  const nombreArchivo = 'productos_import.csv';
  const rutaCSV = path.join(process.cwd(), nombreArchivo);

  if (!fs.existsSync(rutaCSV)) {
    console.error(`❌ No se encontró el archivo: ${rutaCSV}`);
    console.error(`   Colocá el CSV en la raíz del backend con el nombre exacto: ${nombreArchivo}`);
    process.exit(1);
  }

  const contenidoCSV = fs.readFileSync(rutaCSV, 'utf8');
  const filas = parsearCSV(contenidoCSV);
  console.log(`📄 Se leyeron ${filas.length} filas del CSV.\n`);

  let insertados = 0;
  let saltados = 0;
  let errores = 0;

  for (const f of filas) {
    if (!f.id || !f.name) {
      console.log(`⚠️ Fila sin id o nombre, se salta.`);
      continue;
    }

    let imageUrls;
    try {
      imageUrls = f.image_urls ? JSON.parse(f.image_urls) : [];
      if (!Array.isArray(imageUrls)) imageUrls = [];
    } catch {
      imageUrls = [];
    }

    try {
      const rows = await sql`
        INSERT INTO productos (
          id, name, price, price_cash, stock, category, subcategory,
          image_url, image_urls, description, personalizable, destacado,
          descuento_porcentaje, archivado, created_at
        ) VALUES (
          ${f.id},
          ${f.name},
          ${toNumberOrZero(f.price)},
          ${toNumberOrZero(f.price_cash)},
          ${toNumberOrZero(f.stock)},
          ${f.category || ''},
          ${f.subcategory || null},
          ${f.image_url || ''},
          ${JSON.stringify(imageUrls)},
          ${f.description || ''},
          ${toBool(f.personalizable)},
          ${toBool(f.destacado)},
          ${toNumberOrZero(f.descuento_porcentaje)},
          ${toBool(f.archivado)},
          ${f.created_at || new Date().toISOString()}
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING id
      `;

      if (rows.length > 0) {
        console.log(`✅ Insertado: "${f.name}" (${f.id})`);
        insertados++;
      } else {
        console.log(`⏭️  Ya existía, se salta: "${f.name}" (${f.id})`);
        saltados++;
      }
    } catch (err) {
      console.error(`❌ Error insertando "${f.name}" (${f.id}):`, err.message);
      errores++;
    }
  }

  console.log(`\n🎉 Listo. Insertados: ${insertados} | Ya existían: ${saltados} | Errores: ${errores}`);
  console.log(`\n👉 Ahora corré "node migrar-imagenes.js" para pasar las imágenes de los productos nuevos a Cloudinary.`);
}

importar();
