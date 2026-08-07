import { Link } from 'react-router-dom';

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] overflow-hidden bg-bib-black">
      {/* Imagen de fondo posicinada hacia la derecha */}
      <img
        src="/banner-mate-cliente.jpg" 
        alt="Mate artesanal personalizado"
        className="absolute inset-0 w-full h-full object-cover object-[center_30%] md:object-[right_center]"
      />

      {/* Sombra oscura fuerte a la izquierda para poder leer el texto sin tapar el mate */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

      {/* Texto a la izquierda */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-6 sm:px-12 flex flex-col justify-center items-start text-left">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white tracking-widest uppercase mb-2 sm:mb-3 drop-shadow-md">
          HACELO ÚNICO
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-white/90 tracking-[0.2em] font-light uppercase mb-6 sm:mb-8 drop-shadow">
          PERSONALIZADOS CON GRABADOS O APLIQUES
        </p>

        <Link
          to="/grabados"
          className="text-xs sm:text-sm tracking-[0.25em] text-white uppercase border-b border-white/70 pb-1 hover:border-white hover:text-[#C4A278] transition-all duration-300"
        >
          shop now
        </Link>
      </div>
    </section>
  );
}