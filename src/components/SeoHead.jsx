import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://bib-mates-frontend.vercel.app';
const DEFAULT_TITLE = 'BIB Mates | Mates, termos y accesorios con estilo propio';
const DEFAULT_DESCRIPTION = 'Mates, termos, yerbas, canastas y accesorios seleccionados. Envíos a todo el país y envío gratis desde $120.000.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Metadatos por página: título de pestaña, descripción, Open Graph y JSON-LD.
 *
 * Uso básico:
 *   <SeoHead title="Nosotros" description="..." path="/about" />
 *
 * Uso con producto (incluye datos estructurados para Google):
 *   <SeoHead title={product.name} description={product.description} image={product.image_url} path={`/producto/${product.id}`} jsonLd={productJsonLd} />
 *
 * Página personal que no conviene indexar (carrito, favoritos):
 *   <SeoHead title="Favoritos" path="/favoritos" noindex />
 *
 * jsonLd acepta un objeto único o un array de objetos (ej: Product + BreadcrumbList a la vez).
 */
export default function SeoHead({ title, description, image, path = '/', jsonLd, noindex = false }) {
  const fullTitle = title ? `${title} | BIB Mates` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const img = image || DEFAULT_IMAGE;
  const url = `${SITE_URL}${path}`;
  const jsonLdList = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={path.startsWith('/producto') ? 'product' : 'website'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {jsonLdList.map((item, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(item)}</script>
      ))}
    </Helmet>
  );
}