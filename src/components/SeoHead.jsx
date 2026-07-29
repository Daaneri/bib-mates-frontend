import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://bib-mates-frontend.vercel.app';
const DEFAULT_TITLE = 'BIB Mates | Mates, termos y accesorios con estilo propio';
const DEFAULT_DESCRIPTION = 'Mates, termos, yerbas, canastas y accesorios seleccionados. Envíos a todo el país y envío gratis desde $120.000.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Metadatos por página: título de pestaña, descripción, Open Graph y JSON-LD.
 *
 * Uso básico:
 *   <SeoHead title="Nosotros" description="..." />
 *
 * Uso con producto (incluye datos estructurados para Google):
 *   <SeoHead title={product.name} description={product.description} image={product.image_url} path={`/producto/${product.id}`} jsonLd={productJsonLd} />
 */
export default function SeoHead({ title, description, image, path = '/', jsonLd }) {
  const fullTitle = title ? `${title} | BIB Mates` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const img = image || DEFAULT_IMAGE;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={path.startsWith('/producto') ? 'product' : 'website'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}