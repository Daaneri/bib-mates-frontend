import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está definida en el archivo .env');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

function extraerCodigoImagen(url) {
  if (!url) return null;
  const match = url.match(/(IMG_\d+|img_\d+|\d+_IMG_\d+)/i);
  if (match) {
    const parteImg = match[0].match(/IMG_\d+/i);
    return parteImg ? parteImg[0].toUpperCase() : null;
  }
  const partes = url.split('/');
  const nombreArchivo = partes[partes.length - 1];
  return nombreArchivo ? nombreArchivo.split('.')[0].toUpperCase() : null;
}

function parsearCSV(contenido) {
  const lineas = contenido.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lineas.length === 0) return [];

  function dividirLinea(linea) {
    const campos = [];
    let campoActual = '';
    let dentroDeComillas = false;

    for (let i = 0; i < linea.length; i++) {
      const char = linea[i];
      if (char === '"') {
        dentroDeComillas = !dentroDeComillas;
      } else if (char === ',' && !dentroDeComillas) {
        campos.push(campoActual.trim().replace(/^"|"$/g, ''));
        campoActual = '';
      } else {
        campoActual += char;
      }
    }
    campos.push(campoActual.trim().replace(/^"|"$/g, ''));
    return campos;
  }

  const headers = dividirLinea(lineas[0]);
  const idxId = headers.indexOf('id');
  const idxName = headers.indexOf('name');
  const idxImageUrl = headers.indexOf('image_url');

  const resultados = [];
  for (let i = 1; i < lineas.length; i++) {
    const campos = dividirLinea(lineas[i]);
    if (campos[idxId] && campos[idxImageUrl]) {
      resultados.push({
        id: campos[idxId],
        name: campos[idxName] || '',
        image_url: campos[idxImageUrl]
      });
    }
  }
  return resultados;
}

async function vincularPorID() {
  console.log('🚀 Iniciando vinculación directa por UUID (ID de producto)...\n');

  try {
    console.log('🔍 Consultando imágenes disponibles en Cloudinary...');
    const resCloudinary = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500
    });
    const imagenesCloudinary = resCloudinary.resources;
    console.log(`📸 Se encontraron ${imagenesCloudinary.length} imágenes en Cloudinary.\n`);

    const rutaCSV = path.join(process.cwd(), 'productos_rows (1).csv');
    if (!fs.existsSync(rutaCSV)) {
      console.error(`❌ No se encontró el archivo: ${rutaCSV}`);
      process.exit(1);
    }

    const contenidoCSV = fs.readFileSync(rutaCSV, 'utf8');
    const mapeoCSV = parsearCSV(contenidoCSV);
    console.log(`📊 Se leyeron ${mapeoCSV.length} registros del CSV.\n`);

    const productosNeon = await sql`SELECT id, name, image_url FROM productos`;
    console.log(`📦 Se encontraron ${productosNeon.length} productos en Neon.\n`);

    let actualizados = 0;

    for (const producto of productosNeon) {
      // Coincidencia exacta por ID de UUID
      const itemCSV = mapeoCSV.find(item => item.id.trim() === producto.id.trim());

      if (!itemCSV) {
        console.log(`⚠️ ID no encontrado en CSV: "${producto.name}" (${producto.id})`);
        continue;
      }

      const codigoImg = extraerCodigoImagen(itemCSV.image_url);
      if (!codigoImg) {
        console.log(`⚠️ Sin código de imagen para: "${producto.name}"`);
        continue;
      }

      // Buscar la foto correspondiente en Cloudinary por su código (ej. IMG_1837)
      const fotoCloudinary = imagenesCloudinary.find(img => 
        img.public_id.toUpperCase().includes(codigoImg)
      );

      if (fotoCloudinary) {
        const nuevaUrl = `https://res.cloudinary.com/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${fotoCloudinary.public_id}.webp`;

        await sql`UPDATE productos SET image_url = ${nuevaUrl} WHERE id = ${producto.id}`;
        console.log(`✅ [${codigoImg}] "${producto.name}" -> ${nuevaUrl}`);
        actualizados++;
      } else {
        console.log(`❌ [${codigoImg}] No hallada en Cloudinary para: "${producto.name}"`);
      }
    }

    console.log(`\n🎉 ¡Proceso finalizado! Total actualizados en Neon: ${actualizados}/${productosNeon.length}`);

  } catch (error) {
    console.error('❌ Error durante el proceso de vinculación:', error);
  }
}

vincularPorID();