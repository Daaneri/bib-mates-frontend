import { Link } from 'react-router-dom';

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] overflow-hidden bg-bib-black">
      {/* Imagen de fondo desde la carpeta public */}
      <img
        src="/banner-mate-cliente.jpg" 
        alt="Mates y termos artesanales"
        className="absolute inset-0 w-full h-full object-cover object-[center_30%] md:object-[right_center]"
      />

      {/* Sombra en degradé para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

      {/* Contenido con la frase e información original */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-6 sm:px-12 flex flex-col justify-center items-start text-left">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white tracking-widest uppercase mb-2 sm:mb-3 drop-shadow-md">
          MATES Y TERMOS ARTESANALES
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-white/90 tracking-[0.2em] font-light uppercase mb-6 sm:mb-8 drop-shadow">
          CALIDAD Y DISEÑO EN CADA CEBADA
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <a
            href="#seleccion"
            className="px-6 py-3 bg-bib-red text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded hover:bg-red-700 transition text-center"
          >
            Ver Catálogo
          </a>
          <Link
            to="/grabados"
            className="px-6 py-3 border border-white/60 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded hover:bg-white/10 transition text-center"
          >
            Ver Grabados
          </Link>
        </div>
      </div>
    </section>
  );
}