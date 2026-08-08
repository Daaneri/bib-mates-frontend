/**
 * Convierte cualquier imagen (jpg, png, heic-ya-decodificado, etc.) a WebP
 * y la redimensiona si es muy grande, para que el peso final sea siempre
 * liviano sin importar qué formato suba el usuario.
 *
 * Si el navegador no soporta codificar WebP (algunos Safari viejos) o algo
 * falla en el proceso, devuelve el archivo original sin tocar — nunca rompe
 * la subida por un error de compresión.
 */
export async function compressToWebp(file, { maxWidth = 1600, quality = 0.82 } = {}) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  // Los GIF animados pierden la animación al pasar por canvas, así que los dejamos como están.
  if (file.type === 'image/gif') {
    return file;
  }

  try {
    const imgBitmap = await createImageBitmap(file);

    let { width, height } = imgBitmap;
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgBitmap, 0, 0, width, height);
    imgBitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));

    // Si el navegador no puede generar WebP (blob null o sigue siendo el mismo tipo original), usamos el archivo tal cual vino.
    if (!blob || blob.type !== 'image/webp') {
      return file;
    }

    const newName = file.name.replace(/\.[^./\\]+$/, '') + '.webp';
    return new File([blob], newName, { type: 'image/webp' });
  } catch (err) {
    console.error('No se pudo comprimir la imagen, se sube el archivo original:', err);
    return file;
  }
}

/**
 * Aplica compressToWebp a una lista de archivos en paralelo.
 */
export async function compressManyToWebp(files, options) {
  return Promise.all(files.map((f) => compressToWebp(f, options)));
}