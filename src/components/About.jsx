import { siteConfig } from '../config/site';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-5 sm:p-6 md:p-20 text-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-bib-white mb-6 sm:mb-8 uppercase tracking-tight">Nuestra Historia</h1>

      <div className="bg-bib-dark p-5 sm:p-8 md:p-12 rounded border border-bib-white/10">
        <p className="text-base sm:text-lg md:text-xl leading-relaxed text-bib-white/80 mb-6 sm:mb-8">
          En <strong className="text-bib-red">{siteConfig.businessName}</strong>, creemos que tomar mate es siempre una buena idea.
          Nuestra misión es acercarte piezas de calidad, con estilo propio, para que cada ronda
          de mate sea una experiencia distinta.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left mt-8 sm:mt-12 border-t border-bib-white/10 pt-8 sm:pt-12">
          <div>
            <h3 className="text-bib-red font-medium uppercase tracking-widest mb-3 sm:mb-4 text-sm sm:text-base">Calidad real</h3>
            <p className="text-bib-gray text-sm sm:text-base">Trabajamos con materiales seleccionados para asegurar durabilidad y buena terminación en cada pieza.</p>
          </div>
          <div>
            <h3 className="text-bib-red font-medium uppercase tracking-widest mb-3 sm:mb-4 text-sm sm:text-base">Estilo propio</h3>
            <p className="text-bib-gray text-sm sm:text-base">No vendemos productos genéricos; cada pieza está pensada para que se note tu onda a la hora de cebar.</p>
          </div>
        </div>
      </div>
    </div>
  );
}