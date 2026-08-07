export function generarLinkRecuperacionWhatsApp({ telefono, nombre, items, montoTotal }) {
  if (!telefono) return '#';

  // 1. Limpieza y normalización del teléfono
  let phoneClean = telefono.toString().replace(/\D/g, '');

  // Si empieza con 0 (ej: 011...), quitamos el 0 inicial
  if (phoneClean.startsWith('0')) {
    phoneClean = phoneClean.slice(1);
  }

  // Lógica para formatear números de Argentina (+54 9)
  if (!phoneClean.startsWith('549')) {
    if (phoneClean.startsWith('54')) {
      // Si tiene 54 pero le falta el 9 de móvil (ej: 5411...)
      phoneClean = '549' + phoneClean.slice(2);
    } else {
      // Si no tiene prefijo de país (ej: 1112345678 o 3411234567)
      phoneClean = '549' + phoneClean;
    }
  }

  // 2. Mapeo seguro de productos
  const listaProductos = Array.isArray(items) && items.length > 0
    ? items.map(i => `• ${i.name || i.nombre || 'Producto'} (x${i.quantity || i.cantidad || 1})`).join('\n')
    : '• Tu selección de productos';

  // 3. Formateo de cliente y monto
  const nombreCliente = nombre ? nombre.trim() : '';
  const saludo = nombreCliente ? `Hola ${nombreCliente}! 👋` : 'Hola! 👋';
  const totalFormateado = montoTotal ? Number(montoTotal).toLocaleString('es-AR') : '0';

  // 4. Mensaje
  const mensaje = `${saludo} Vimos que dejaste seleccionado tu pedido en *Bib Mates*:\n\n${listaProductos}\n\n*Total:* $${totalFormateado}\n\n¿Tuviste algún problema con el pago o querés consultarnos algo para completarlo? Podemos ayudarte a finalizar la compra por acá. 🧉`;

  return `https://wa.me/${phoneClean}?text=${encodeURIComponent(mensaje)}`;
}