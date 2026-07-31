// src/pages/LegalPages.jsx
export function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-bib-gray space-y-6">
      <h1 className="text-3xl font-heading font-bold text-bib-white">Política de Privacidad</h1>
      <p className="text-xs text-bib-gray/60">Última actualización: 2026</p>
      
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-bib-white">1. Recopilación de Datos</h2>
        <p className="text-sm leading-relaxed">
          En <strong>BIB Mates</strong> recopilamos información personal básica que nos proporcionás de forma voluntaria (nombre, teléfono, dirección y correo electrónico) exclusivamente para gestionar tus pedidos y envíos.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-bib-white">2. Google Analytics y Cookies</h2>
        <p className="text-sm leading-relaxed">
          Utilizamos Google Analytics para analizar el tráfico de nuestra tienda web de forma anónima. Estas herramientas solo se activan si otorgás tu consentimiento expreso mediante nuestro banner de cookies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-bib-white">3. Protección de la Información</h2>
        <p className="text-sm leading-relaxed">
          Tus datos se almacenan de forma segura y bajo ningún punto de vista se comercializan ni se ceden a terceros ajenos a la operativa logística de la tienda.
        </p>
      </section>
    </div>
  );
}

export function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-bib-gray space-y-6">
      <h1 className="text-3xl font-heading font-bold text-bib-white">Términos de Servicio</h1>
      <p className="text-xs text-bib-gray/60">Última actualización: 2026</p>
      
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-bib-white">1. Condiciones generales</h2>
        <p className="text-sm leading-relaxed">
          Al utilizar nuestro sitio web <span className="text-bib-white">bib-mates-frontend.vercel.app</span> y realizar compras, aceptás los presentes términos y condiciones.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-bib-white">2. Productos y Stock</h2>
        <p className="text-sm leading-relaxed">
          Los mates y accesorios publicados están sujetos a disponibilidad de stock. Las características artesanales de nuestros productos pueden generar variaciones mínimas respecto a las fotografías ilustrativas.
        </p>
      </section>
    </div>
  );
}