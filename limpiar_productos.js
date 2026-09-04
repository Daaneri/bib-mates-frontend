import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

    const sql = neon("postgresql://neondb_owner:npg_Bh9wyVfjvK2A@ep-steep-pine-ac06lot0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require");

async function limpiarProductosRotos() {
  console.log("🧹 Limpiando URLs rotas de Supabase en los productos...");

  await sql`
    UPDATE productos 
    SET image_url = NULL 
    WHERE image_url LIKE '%supabase.co%'
  `;

  console.log("✅ ¡Listo! Se limpiaron las URLs rotas para que dejen de tirar error 402 en la web.");
  console.log("✨ Ya puedes apagar todo y descansar en paz.");
}

limpiarProductosRotos();