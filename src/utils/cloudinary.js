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
  return data.secure_url;
}