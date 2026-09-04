import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = neon("postgresql://neondb_owner:npg_Bh9wyVfjvK2A@ep-steep-pine-ac06lot0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require");

cloudinary.config({
  cloud_name: "yityx3w4",
  api_key: "349565419611317",
  api_secret: "RGJ5vjoV16ngewLXr74RElITM9c",
});

async function migrarProductos() {
  console.log("🚀 Buscando productos con imágenes en Supabase...");

  const productos = await sql`SELECT id, image_url FROM productos`;

  console.log(`📦 Encontrados ${productos.length} productos para revisar.`);

  for (const prod of productos) {
    if (prod.image_url && prod.image_url.includes("supabase.co")) {
      try {
        console.log(`📤 Subiendo imagen del producto ID ${prod.id}...`);
        const uploadResult = await cloudinary.uploader.upload(prod.image_url, {
          folder: "bib_productos",
          format: "webp",
        });

        const nuevaImagenUrl = uploadResult.secure_url;

        await sql`
          UPDATE productos 
          SET image_url = ${nuevaImagenUrl}
          WHERE id = ${prod.id}
        `;
        console.log(`✅ Producto ID ${prod.id} actualizado con éxito a Cloudinary.`);
      } catch (e) {
        console.error(`❌ Error en producto ${prod.id}:`, e.message);
      }
    }
  }

  console.log("✨ ¡Migración de productos finalizada! Ya puedes descansar.");
}

migrarProductos();