import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { neon } from "@neondatabase/serverless";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = neon("postgresql://neondb_owner:npg_Bh9wyVfjvK2A@ep-steep-pine-ac06lot0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require");

cloudinary.config({
  cloud_name: "yityx3w4",
  api_key: "349565419611317",
  api_secret: "RGJ5vjoV16ngewLXr74RElITM9c",
});

const categoriasNombres = ["Mates", "Bombillones", "Termos", "Canastas", "Yerbas"];

async function ejecutarMigracion() {
  console.log("🚀 Iniciando subida masiva a Cloudinary y actualización en Neon...");

  // 1. Asegurarnos de que la columna imagen_url exista en la tabla categorias
  try {
    await sql`ALTER TABLE categorias ADD COLUMN IF NOT EXISTS imagen_url TEXT;`;
    console.log("🛠️ Columna 'imagen_url' verificada/creada con éxito en Neon.");
  } catch (e) {
    console.log("⚠️ Nota sobre la columna:", e.message);
  }

  const folderPath = path.join(__dirname, "imagenes_categorias");
  if (!fs.existsSync(folderPath)) {
    console.error("❌ No se encontró la carpeta imagenes_categorias");
    return;
  }

  const archivos = fs.readdirSync(folderPath).filter(file => 
    /\.(jpg|jpeg|png|webp|heic)$/i.test(file)
  );

  if (archivos.length === 0) {
    console.error("❌ No hay imágenes en la carpeta imagenes_categorias");
    return;
  }

  for (let i = 0; i < categoriasNombres.length; i++) {
    if (i >= archivos.length) break;
    
    const categoria = categoriasNombres[i];
    const archivoLocal = path.join(folderPath, archivos[i]);

    try {
      console.log(`📤 Subiendo imagen de ${categoria} (${archivos[i]}) a Cloudinary...`);
      const uploadResult = await cloudinary.uploader.upload(archivoLocal, {
        folder: "bib_categorias",
        format: "webp",
      });

      const imageUrl = uploadResult.secure_url;

      console.log(`💾 Actualizando categoría '${categoria}' en Neon...`);
      await sql`
        UPDATE categorias 
        SET imagen_url = ${imageUrl} 
        WHERE LOWER(nombre) = LOWER(${categoria})
      `;

      console.log(`✅ ¡${categoria} actualizado con éxito!\n`);
    } catch (error) {
      console.error(`❌ Error procesando ${categoria}:`, error.message);
    }
  }

  console.log("✨ ¡Migración de categorías finalizada!");
}

ejecutarMigracion();