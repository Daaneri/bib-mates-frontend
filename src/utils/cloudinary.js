const CLOUD_NAME = 'yityx3w4'; 
const UPLOAD_PRESET = 'preset_productos'; 

export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Error al subir la imagen a Cloudinary');
  }

  const data = await res.json();

  // Insertamos la transformación f_webp en la URL para que Cloudinary
  // entregue siempre WebP, sin importar en qué formato se haya subido
  // el archivo original (jpg, png, heic, etc.). q_auto ajusta la calidad
  // automáticamente según el contenido de la imagen.
  return data.secure_url.replace('/upload/', '/upload/f_webp,q_auto/');
}