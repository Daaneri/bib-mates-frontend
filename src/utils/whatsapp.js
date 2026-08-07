export function generarLinkRecuperacionWhatsApp({ telefono, nombre, items, montoTotal }) {
  let phoneClean = telefono.replace(/\D/g, '');
  if (!phoneClean.startsWith('549') && phoneClean.startsWith('11')) {
    phoneClean = '549' + phoneClean;
  } else if (!phoneClean.startsWith('54')) {
    phoneClean = '549' + phoneClean;
  }

  const listaProductos = items.map(i => `• ${i.name} (x${i.quantity})`).join('\n');

  const mensaje = `Hola ${nombre}! 👋 Vimos que dejaste seleccionado tu pedido en *Bib Mates*:\n\n${listaProductos}\n\n*Total:* $${montoTotal.toLocaleString('es-AR')}\n\n¿Tuviste algún problema con el pago o querés consultarnos algo para completarlo? Podemos ayudarte a finalizar la compra por acá mate.`;

  return `https://wa.me/${phoneClean}?text=${encodeURIComponent(mensaje)}`;
}