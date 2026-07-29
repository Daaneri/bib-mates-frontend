import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import FadeIn from './FadeIn';

export default function NotFound() {
  return (
    <FadeIn>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 gap-4">
        <div className="w-16 h-16 rounded-full border border-dashed border-bib-white/15 flex items-center justify-center">
          <Compass size={26} className="text-bib-white/25" strokeWidth={1.25} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-bib-white lowercase">página no encontrada</h1>
        <p className="text-bib-gray text-sm max-w-[280px] -mt-2">
          Parece que este mate se perdió en el camino. Volvé al inicio y encontrá lo que buscabas.
        </p>
        <Link to="/" className="mt-2 bg-bib-red hover:bg-bib-white text-bib-black font-medium rounded px-8 py-3 uppercase tracking-widest text-xs transition-colors">
          Volver al inicio
        </Link>
      </div>
    </FadeIn>
  );
}