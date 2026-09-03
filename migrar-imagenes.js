import dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está definida en el archivo .env');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function migrar() {
  console.log('🚀 Iniciando migración de imágenes a Cloudinary...');

  try {
    // Usamos image_url en lugar de imagen_url
    const productos = await sql`
      SELECT id, image_url FROM productos 
      WHERE image_url LIKE '%supabase%' OR image_url LIKE '%http%'
    `;

    console.log(`📸 Se encontraron ${productos.length} productos para migrar.`);

    for (const p of productos) {
      if (!p.image_url) continue;
      
      console.log(`Subiendo imagen de producto ID ${p.id}...`);
      const res = await cloudinary.uploader.upload(p.image_url, {
        folder: 'productos_bibmates'
      });

      const urlWebp = res.secure_url.replace('/upload/', '/upload/f_webp,q_auto/');

      await sql`UPDATE productos SET image_url = ${urlWebp} WHERE id = ${p.id}`;
      console.log(`✅ Producto ID ${p.id} actualizado a: ${urlWebp}`);
    }

    console.log('🎉 ¡Migración de imágenes completada con éxito!');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

migrar();