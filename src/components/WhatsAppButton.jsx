import { MessageCircle } from 'lucide-react';
import { siteConfig } from '../config/site';

export default function WhatsAppButton() {
  // Número de WhatsApp formateado sin espacios ni guiones (ejemplo: 5491132585236)
  const phone = siteConfig?.whatsappNumber || '5491132585236'; 
  const message = encodeURIComponent('¡Hola! Quisiera realizar una consulta.');

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      /*
        `bottom-20`: En móvil queda a 80px del fondo (justo arriba del carrito).
        `sm:bottom-24`: En desktop queda a 96px del fondo.
      */
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 bg-[#25D366] text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
    >
      <MessageCircle size={20} className="sm:hidden fill-current" />
      <MessageCircle size={24} className="hidden sm:block fill-current" />
    </a>
  );
}