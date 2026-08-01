import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import 'dotenv/config';

const SITE_URL = 'https://bib-mates-frontend.vercel.app';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function generar() {
  const { data: productos, error } = await supabase
    .from('productos')
    .select('id, archivado');

  if (error) {
    console.error('Error trayendo productos de Supabase:', error.message);
    process.exit(1);
  }

  const hoy = new Date().toISOString().split('T')[0];

  const paginasEstaticas = [
    { path: '', priority: '1.0' },
    { path: 'about', priority: '0.6' },
    { path: 'opiniones', priority: '0.6' },
  ];

  const urlsEstaticas = paginasEstaticas.map(({ path, priority }) => `
  <url>
    <loc>${SITE_URL}/${path}</loc>
    <lastmod>${hoy}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

  const productosActivos = (productos || []).filter(p => p.archivado !== true);

  const urlsProductos = productosActivos.map(p => `
  <url>
    <loc>${SITE_URL}/producto/${p.id}</loc>
    <lastmod>${hoy}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlsEstaticas}${urlsProductos}
</urlset>
`;

  fs.writeFileSync('./public/sitemap.xml', xml.trim() + '\n');
  console.log(`✔ Sitemap generado con ${paginasEstaticas.length + productosActivos.length} URLs en public/sitemap.xml`);
}

generar();