import { siteConfig } from '../config/site';
import { Award, Sparkles } from 'lucide-react';
import FadeIn from './FadeIn';
import SeoHead from './SeoHead';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-5 sm:p-6 md:p-20 text-center">
      <SeoHead
        title="Nosotros"
        description={`Conocé la historia de ${siteConfig.businessName}: calidad real y estilo propio en cada mate, termo y accesorio.`}
        path="/about"
      />

      <FadeIn>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-bib-white mb-6 sm:mb-8 lowercase tracking-tight">
          nuestra historia
        </h1>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="bg-bib-dark p-5 sm:p-8 md:p-12 rounded border border-bib-white/10">
          <p className="text-base sm:text-lg md:text-xl leading-relaxed text-bib-white/80 mb-6 sm:mb-8">
            En <strong className="text-bib-red">{siteConfig.businessName}</strong>, creemos que tomar mate es siempre una buena idea.
            Nuestra misión es acercarte piezas de calidad, con estilo propio, para que cada ronda
            de mate sea una experiencia distinta.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left mt-8 sm:mt-12 border-t border-bib-white/10 pt-8 sm:pt-12">
            <div className="group flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-bib-red/10 border border-bib-red/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Award size={18} className="text-bib-red" />
              </div>
              <div>
                <h3 className="text-bib-red font-medium uppercase tracking-widest mb-2 sm:mb-3 text-sm sm:text-base">Calidad real</h3>
                <p className="text-bib-gray text-sm sm:text-base">Trabajamos con materiales seleccionados para asegurar durabilidad y buena terminación en cada pieza.</p>
              </div>
            </div>
            <div className="group flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-bib-red/10 border border-bib-red/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Sparkles size={18} className="text-bib-red" />
              </div>
              <div>
                <h3 className="text-bib-red font-medium uppercase tracking-widest mb-2 sm:mb-3 text-sm sm:text-base">Estilo propio</h3>
                <p className="text-bib-gray text-sm sm:text-base">No vendemos productos genéricos; cada pieza está pensada para que se note tu onda a la hora de cebar.</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}