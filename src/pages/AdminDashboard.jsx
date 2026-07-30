import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, Check } from 'lucide-react';
import { siteConfig } from '../config/site';
import { CATEGORIES as CATEGORIAS, SUBCATEGORIES } from '../config/categories';

export default function AdminDashboard() {
  const [view, setView] = useState('Inventario');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]); // [{ file, preview, selected }] — fotos adicionales del producto nuevo
  const [nuevaCategoria, setNuevaCategoria] = useState(CATEGORIAS[0]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [verArchivados, setVerArchivados] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', price: '', stock: 0, description: '', image_url: '', image_urls: [], personalizable: false, category: '', subcategory: '' });
  const [storageFiles, setStorageFiles] = useState([]);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [pickerMode, setPickerMode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  function handleExtraFilesChange(e) {
    const nuevos = Array.from(e.target.files).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      selected: true, // vienen tildadas/seleccionadas por defecto
    }));
    setExtraFiles((prev) => [...prev, ...nuevos]);
    e.target.value = ''; // permite volver a elegir el mismo archivo si lo saca y lo quiere sumar de nuevo
  }

  function toggleExtraFile(index) {
    setExtraFiles((prev) => prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item)));
  }

  function quitarExtraFile(index) {
    setExtraFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function limpiarExtraFiles() {
    extraFiles.forEach((item) => URL.revokeObjectURL(item.preview));
    setExtraFiles([]);
  }

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3000);
  };

  async function fetchData() {
    const { data: p } = await supabase.from('productos').select('*');
    const { data: o } = await supabase.from('orders').select('*').order('creado_en', { ascending: false });
    const { data: r } = await supabase.from('resenas').select('*').order('created_at', { ascending: false });
    setProductos(p || []);
    setPedidos(o || []);
    setResenas(r || []);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const price = parseFloat(formData.get('price'));
    const stock = parseInt(formData.get('stock'));
    const category = formData.get('category');
    const subcategory = formData.get('subcategory') || null;
    const description = formData.get('description');
    const personalizable = formData.get('personalizable') === 'on';

    let imageUrl = '';
    if (file) {
      const { data } = await supabase.storage.from('productos').upload(`${Date.now()}_${file.name}`, file);
      if (data) imageUrl = supabase.storage.from('productos').getPublicUrl(data.path).data.publicUrl;
    }

    // Solo se suben las fotos adicionales que quedaron tildadas/seleccionadas
    const imageUrlsExtra = [];
    const seleccionadas = extraFiles.filter((item) => item.selected);
    for (const item of seleccionadas) {
      const { data } = await supabase.storage.from('productos').upload(`${Date.now()}_${item.file.name}`, item.file);
      if (data) imageUrlsExtra.push(supabase.storage.from('productos').getPublicUrl(data.path).data.publicUrl);
    }

    const { error } = await supabase.from('productos').insert([{ name, price, stock, category, subcategory, image_url: imageUrl, image_urls: imageUrlsExtra, description, personalizable }]);
    if (error) mostrarMensaje("Error: " + error.message);
    else {
      mostrarMensaje("Producto agregado con éxito");
      setFile(null);
      limpiarExtraFiles();
      e.target.reset();
      setNuevaCategoria(CATEGORIAS[0]);
      fetchData();
    }
    setLoading(false);
  }

  async function fetchStorageFiles() {
    setLoadingStorage(true);
    const { data, error } = await supabase.storage.from('productos').list('', { limit: 200, sortBy: { column: 'name', order: 'desc' } });
    if (!error && data) {
      const archivos = data
        .filter(f => f.name && !f.name.endsWith('/'))
        .map(f => ({
          name: f.name,
          url: supabase.storage.from('productos').getPublicUrl(f.name).data.publicUrl,
        }));
      setStorageFiles(archivos);
    }
    setLoadingStorage(false);
  }

  function abrirPicker(modo) {
    setPickerMode(modo);
    if (storageFiles.length === 0) fetchStorageFiles();
  }

  function elegirImagen(url) {
    if (pickerMode === 'main') {
      setEditData({ ...editData, image_url: url });
      setPickerMode(null);
    } else if (pickerMode === 'extra') {
      const yaEsta = editData.image_urls.includes(url);
      setEditData({
        ...editData,
        image_urls: yaEsta
          ? editData.image_urls.filter(u => u !== url)
          : [...editData.image_urls, url],
      });
    }
  }

  function quitarImagenExtra(url) {
    setEditData({ ...editData, image_urls: editData.image_urls.filter(u => u !== url) });
  }

  async function handleUpdate(product) {
    const { error } = await supabase.from('productos')
      .update({
        name: editData.name,
        price: editData.price.toString(),
        stock: parseInt(editData.stock),
        description: editData.description,
        category: editData.category,
        subcategory: editData.subcategory || null,
        image_url: editData.image_url,
        image_urls: editData.image_urls,
        personalizable: editData.personalizable,
      })
      .eq('id', product.id);

    if (error) mostrarMensaje("Error al actualizar: " + error.message);
    else {
      mostrarMensaje("Producto actualizado");
      setEditId(null);
      fetchData();
    }
  }

  async function handleArchive(id, estadoActual) {
    const { error } = await supabase.from('productos').update({ archivado: !estadoActual }).eq('id', id);
    if (error) mostrarMensaje("Error al archivar: " + error.message);
    else {
      mostrarMensaje(estadoActual ? "Producto restaurado" : "Producto archivado");
      fetchData();
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) mostrarMensaje("Error: " + error.message);
    else {
      mostrarMensaje("Producto eliminado");
      fetchData();
    }
  }

  async function handleUpdateOrderStatus(identificador, nuevoEstado) {
    const { error } = await supabase.from('orders').update({ estado: nuevoEstado }).eq('identificador', identificador);
    if (error) mostrarMensaje("Error al actualizar pedido: " + error.message);
    else {
      mostrarMensaje("Pedido actualizado");
      fetchData();
    }
  }

  async function handleAprobarResena(id) {
    const { error } = await supabase.from('resenas').update({ aprobado: true }).eq('id', id);
    if (error) mostrarMensaje("Error al aprobar: " + error.message);
    else {
      mostrarMensaje("Reseña aprobada");
      fetchData();
    }
  }

  async function handleRechazarResena(id) {
    if (!window.confirm("¿Eliminar esta reseña?")) return;
    const { error } = await supabase.from('resenas').delete().eq('id', id);
    if (error) mostrarMensaje("Error: " + error.message);
    else {
      mostrarMensaje("Reseña eliminada");
      fetchData();
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) mostrarMensaje("Error al cerrar sesión");
    else navigate('/login');
  }

  const productosFiltrados = productos.filter(p => {
    const coincideCat = categoriaFiltro === 'Todos' || p.category === categoriaFiltro;
    const coincideBusqueda = p.name.toLowerCase().includes(busqueda.toLowerCase());
    const coincideArchivado = verArchivados ? p.archivado === true : p.archivado !== true;
    return coincideCat && coincideBusqueda && coincideArchivado;
  });

  const resenasPendientes = resenas.filter(r => !r.aprobado);
  const resenasAprobadas = resenas.filter(r => r.aprobado);

  const estadoColor = (estado) => {
    if (estado === 'pagado') return 'bg-green-900/40 text-green-300 border-green-700/40';
    if (estado === 'pendiente') return 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40';
    if (estado === 'fallido') return 'bg-red-900/40 text-red-300 border-red-700/40';
    return 'bg-bib-black text-bib-white border-bib-white/10';
  };

  const stockColor = (stock) => {
    if (stock === 0) return 'bg-red-900/40 text-red-300 border-red-700/40';
    if (stock < 5) return 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40';
    return 'bg-green-900/40 text-green-300 border-green-700/40';
  };

  const subcategoriasNueva = SUBCATEGORIES[nuevaCategoria] || [];
  const subcategoriasEdit = SUBCATEGORIES[editData.category] || [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bib-black text-bib-white">
      <aside className="w-full md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r border-bib-white/10 p-4 md:p-6 flex flex-col shrink-0">
        <h1 className="text-lg md:text-xl mb-4 md:mb-12 uppercase tracking-widest font-medium">{siteConfig.businessName} Admin</h1>
        <nav className="flex md:flex-col gap-3 md:gap-0 md:space-y-6 flex-grow overflow-x-auto pb-2">
          {['Inventario', 'Pedidos', 'Reseñas', 'Métricas'].map(item => (
            <button key={item} onClick={() => setView(item)} className={`relative transition whitespace-nowrap text-sm uppercase tracking-widest text-left ${view === item ? 'text-bib-red font-medium' : 'text-bib-gray hover:text-bib-white'}`}>
              {item}
              {item === 'Reseñas' && resenasPendientes.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center bg-bib-red text-bib-white text-[10px] font-medium w-4 h-4 rounded-full">
                  {resenasPendientes.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button onClick={handleSignOut} className="text-bib-red hover:text-bib-white text-left mt-4 md:mt-auto text-sm uppercase tracking-widest">Cerrar sesión</button>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-16 min-w-0">
        {mensaje && <div className="bg-bib-red text-bib-white p-3 rounded mb-4 text-center text-sm uppercase tracking-widest">{mensaje}</div>}

        {view === 'Inventario' && (
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            <form onSubmit={handleAddProduct} className="max-w-4xl mx-auto bg-bib-dark p-5 md:p-8 rounded border border-bib-white/10 space-y-3 md:space-y-4">
              <h3 className="text-sm md:text-base mb-2 md:mb-4 uppercase tracking-widest font-medium">Nuevo Producto</h3>
              <input name="name" placeholder="Nombre" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base" required />
              <input name="price" type="number" step="any" placeholder="Precio" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base" required />
              <input name="stock" type="number" placeholder="Stock" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base" required />
              <textarea name="description" placeholder="Descripción del producto" rows={3} className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base resize-none" />
              <select name="category" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base">
                {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {subcategoriasNueva.length > 0 && (
                <select name="subcategory" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base">
                  <option value="">Sin subcategoría</option>
                  {subcategoriasNueva.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              )}
              {nuevaCategoria === 'Yerbas' && (
                <input name="subcategory" placeholder="Marca de la yerba" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base" />
              )}
              <label className="flex items-center gap-2 text-sm text-bib-gray">
                <input type="checkbox" name="personalizable" className="w-4 h-4 accent-bib-red" />
                ¿Es personalizable / grabable?
              </label>
              <div className="flex flex-col items-center gap-2">
                <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                <label htmlFor="fileInput" className="cursor-pointer bg-bib-black px-6 py-2 rounded border border-bib-white/20 hover:border-bib-red transition text-xs md:text-sm text-center break-all">
                  {file ? file.name : "Seleccionar Imagen principal"}
                </label>
              </div>

              <div className="space-y-2 bg-bib-black p-3 rounded border border-bib-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-bib-gray font-medium uppercase tracking-wide">Fotos adicionales (opcional)</p>
                  <label htmlFor="extraFilesInput" className="cursor-pointer text-xs bg-bib-dark px-3 py-1.5 rounded border border-bib-white/20 hover:border-bib-red transition">
                    + Agregar
                  </label>
                  <input type="file" id="extraFilesInput" className="hidden" accept="image/*" multiple onChange={handleExtraFilesChange} />
                </div>

                {extraFiles.length > 0 && (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                      {extraFiles.map((item, i) => (
                        <div key={i} className="relative">
                          <button
                            type="button"
                            onClick={() => toggleExtraFile(i)}
                            className={`aspect-square w-full rounded overflow-hidden border-2 transition-all duration-200 ${
                              item.selected
                                ? 'border-green-500'
                                : 'border-bib-white/10 opacity-40 grayscale hover:opacity-70'
                            }`}
                          >
                            <img src={item.preview} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                          </button>
                          {item.selected && (
                            <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => quitarExtraFile(i)}
                            className="absolute -bottom-1.5 -right-1.5 bg-bib-red text-white rounded-full w-4 h-4 text-[9px] leading-none flex items-center justify-center shadow"
                            title="Quitar esta foto de la lista"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-bib-gray pt-1">
                      Tocá una foto para incluirla o excluirla. Las tildadas en verde se suben con el producto; las apagadas en gris no se suben.
                    </p>
                  </>
                )}
              </div>

              <button disabled={loading} className="bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black w-full px-8 py-3 rounded font-medium text-sm md:text-base uppercase tracking-widest transition-colors">GUARDAR</button>
            </form>

            <input type="text" placeholder="Buscar producto..." className="max-w-4xl mx-auto block w-full bg-bib-dark p-3 rounded border border-bib-white/20 px-6 mb-2 text-sm md:text-base" onChange={(e) => setBusqueda(e.target.value)} />

            <div className="max-w-4xl mx-auto flex gap-2 mb-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-auto md:px-0 scrollbar-hide">
              {['Todos', ...CATEGORIAS].map(cat => (
                <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`px-5 md:px-6 py-1.5 rounded text-xs md:text-sm whitespace-nowrap shrink-0 uppercase tracking-wide ${categoriaFiltro === cat ? 'bg-bib-red text-bib-white' : 'bg-bib-dark text-bib-gray border border-bib-white/10'}`}>{cat}</button>
              ))}
            </div>

            <div className="max-w-4xl mx-auto flex justify-end">
              <button
                onClick={() => setVerArchivados(!verArchivados)}
                className={`px-4 py-1.5 rounded text-xs border transition uppercase tracking-wide ${verArchivados ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/40' : 'border-bib-white/10 text-bib-gray hover:text-bib-white'}`}
              >
                {verArchivados ? '← Ver productos activos' : 'Ver archivados'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {productosFiltrados.map(p => (
                <div key={p.id} className="bg-bib-dark p-4 md:p-5 rounded border border-bib-white/10 space-y-3 flex flex-col">
                  {editId === p.id ? (
                    <div className="space-y-2">
                      <input className="w-full bg-bib-black p-2 rounded border border-bib-white/20 text-sm px-4" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} placeholder="Nombre" />
                      <textarea className="w-full bg-bib-black p-2 rounded border border-bib-white/20 text-sm px-4 resize-none" rows={2} value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} placeholder="Descripción" />

                      <select className="w-full bg-bib-black p-2 rounded border border-bib-white/20 text-sm px-4" value={editData.category} onChange={(e) => setEditData({...editData, category: e.target.value, subcategory: ''})}>
                        {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>

                      {subcategoriasEdit.length > 0 ? (
                        <select className="w-full bg-bib-black p-2 rounded border border-bib-white/20 text-sm px-4" value={editData.subcategory} onChange={(e) => setEditData({...editData, subcategory: e.target.value})}>
                          <option value="">Sin subcategoría</option>
                          {subcategoriasEdit.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                      ) : editData.category === 'Yerbas' ? (
                        <input className="w-full bg-bib-black p-2 rounded border border-bib-white/20 text-sm px-4" placeholder="Marca de la yerba" value={editData.subcategory} onChange={(e) => setEditData({...editData, subcategory: e.target.value})} />
                      ) : null}

                      <label className="flex items-center gap-2 text-xs text-bib-gray">
                        <input type="checkbox" checked={editData.personalizable} onChange={(e) => setEditData({...editData, personalizable: e.target.checked})} className="w-4 h-4 accent-bib-red" />
                        ¿Es personalizable / grabable?
                      </label>

                      <div className="space-y-2 bg-bib-black p-3 rounded border border-bib-white/10">
                        <p className="text-xs text-bib-gray font-medium uppercase tracking-wide">Foto principal</p>
                        <div className="flex items-center gap-3">
                          {editData.image_url ? (
                            <img src={editData.image_url} alt="Principal" className="w-14 h-14 rounded object-cover border border-bib-white/10" />
                          ) : (
                            <div className="w-14 h-14 rounded bg-bib-dark border border-bib-white/10 flex items-center justify-center text-[9px] text-bib-gray text-center">Sin foto</div>
                          )}
                          <button type="button" onClick={() => abrirPicker('main')} className="text-xs bg-bib-dark px-3 py-2 rounded border border-bib-white/20 hover:border-bib-red transition">
                            Elegir del storage
                          </button>
                        </div>

                        <p className="text-xs text-bib-gray font-medium uppercase tracking-wide pt-2">Fotos adicionales</p>
                        <div className="flex flex-wrap gap-2">
                          {editData.image_urls.map(url => (
                            <div key={url} className="relative">
                              <img src={url} alt="Extra" className="w-12 h-12 rounded object-cover border border-bib-white/10" />
                              <button type="button" onClick={() => quitarImagenExtra(url)} className="absolute -top-1 -right-1 bg-bib-red text-bib-white rounded-full w-4 h-4 text-[9px] leading-none flex items-center justify-center">×</button>
                            </div>
                          ))}
                          <button type="button" onClick={() => abrirPicker('extra')} className="text-xs bg-bib-dark px-3 py-2 rounded border border-bib-white/20 hover:border-bib-red transition h-fit self-center">
                            + Agregar fotos
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <input className="bg-bib-black p-2 rounded border border-bib-white/20 w-24 text-sm px-4" placeholder="Stock" value={editData.stock} type="number" onChange={(e) => setEditData({...editData, stock: e.target.value})} />
                        <input className="bg-bib-black p-2 rounded border border-bib-white/20 w-28 text-sm px-4" placeholder="Precio" value={editData.price} type="number" onChange={(e) => setEditData({...editData, price: e.target.value})} />
                        <button type="button" onClick={() => handleUpdate(p)} className="bg-green-600 text-white px-5 py-2 rounded text-xs font-medium uppercase tracking-wide">Guardar cambios</button>
                        <button type="button" onClick={() => setEditId(null)} className="text-bib-gray px-3 py-2 text-xs uppercase tracking-wide">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3 flex-1">
                        <div className="min-w-0">
                          <p className="font-medium text-base md:text-lg text-bib-white">{p.name}</p>
                          {p.description && (
                            <p className="text-xs md:text-sm text-bib-gray mt-1 line-clamp-2">{p.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded text-xs border font-medium ${stockColor(p.stock ?? 0)}`}>
                            Stock: {p.stock ?? 0}
                          </span>
                          <span className="font-medium text-lg md:text-xl text-bib-red tracking-wide">
                            ${p.price}
                          </span>
                          {p.subcategory && (
                            <span className="px-2 py-1 rounded text-[10px] border border-bib-white/20 text-bib-gray uppercase tracking-wide">{p.subcategory}</span>
                          )}
                          {p.personalizable && (
                            <span className="px-2 py-1 rounded text-[10px] border border-bib-red/40 text-bib-red uppercase tracking-wide">Personalizable</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 pt-1 border-t border-bib-white/10 mt-1">
                        <button onClick={() => { setEditId(p.id); setEditData({ name: p.name, price: p.price, stock: p.stock, description: p.description || '', image_url: p.image_url || '', image_urls: Array.isArray(p.image_urls) ? p.image_urls : [], personalizable: p.personalizable === true, category: p.category, subcategory: p.subcategory || '' }); }} className="text-blue-400 font-medium hover:text-blue-300 transition text-xs md:text-sm pt-2 uppercase tracking-wide">Editar</button>
                        <button onClick={() => handleArchive(p.id, p.archivado === true)} className="text-yellow-400 font-medium hover:text-yellow-300 transition text-xs md:text-sm pt-2 uppercase tracking-wide">{p.archivado ? 'Restaurar' : 'Archivar'}</button>
                        <button onClick={() => handleDelete(p.id)} className="text-bib-red font-medium hover:text-bib-white transition text-xs md:text-sm pt-2 uppercase tracking-wide">Eliminar</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'Pedidos' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-yellow-900/30 border border-yellow-700/40 text-yellow-300 p-4 rounded text-sm">
              Esta sección todavía apunta a una tabla/schema pendiente de confirmar contra el backend real. No la des por funcional hasta revisarlo.
            </div>
            {pedidos.length === 0 && (
              <div className="bg-bib-dark p-8 rounded border border-bib-white/10 text-center text-bib-gray">
                Todavía no hay pedidos.
              </div>
            )}

            {pedidos.map(o => (
              <div key={o.identificador} className="bg-bib-dark p-5 md:p-6 rounded border border-bib-white/10 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-base md:text-lg text-bib-white">{o.nombre_del_cliente}</p>
                    <p className="text-xs md:text-sm text-bib-gray">{o.telefono}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs border shrink-0 ${estadoColor(o.estado)}`}>
                    {o.estado}
                  </span>
                </div>

                <div className="text-xs md:text-sm text-bib-gray space-y-0.5">
                  <p>{o.direccion}, {o.ciudad} {o.provincia && `(${o.provincia})`} {o.codigo_postal && `- CP ${o.codigo_postal}`}</p>
                  {o.creado_en && (
                    <p className="text-bib-gray/60">
                      {new Date(o.creado_en).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                {Array.isArray(o.productos) && o.productos.length > 0 && (
                  <div className="bg-bib-black rounded p-3 space-y-1">
                    {o.productos.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs md:text-sm text-bib-white">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-bib-white/10">
                  <div className="text-xs md:text-sm text-bib-gray">
                    Envío: {o.costo_de_envio > 0 ? `$${Number(o.costo_de_envio).toLocaleString('es-AR')}` : 'Sin costo'}
                  </div>
                  <div className="font-medium text-lg md:text-xl text-bib-red">
                    ${Number(o.total).toLocaleString('es-AR')}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {['pendiente', 'pagado', 'enviado', 'fallido'].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => handleUpdateOrderStatus(o.identificador, estado)}
                      className={`px-3 py-1 rounded text-xs border transition uppercase tracking-wide ${
                        o.estado === estado
                          ? 'bg-bib-red text-bib-white border-bib-red'
                          : 'border-bib-white/10 text-bib-gray hover:text-bib-white hover:border-bib-white/30'
                      }`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'Reseñas' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h3 className="text-sm font-medium text-bib-white uppercase tracking-widest mb-4">
                Pendientes de aprobación {resenasPendientes.length > 0 && `(${resenasPendientes.length})`}
              </h3>
              {resenasPendientes.length === 0 ? (
                <div className="bg-bib-dark p-8 rounded border border-bib-white/10 text-center text-bib-gray text-sm">
                  No hay reseñas pendientes.
                </div>
              ) : (
                <div className="space-y-3">
                  {resenasPendientes.map(r => (
                    <div key={r.id} className="bg-bib-dark p-5 rounded border border-yellow-700/40 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-bib-white text-sm">{r.customer_name}</p>
                          <p className="text-xs text-bib-gray">{r.customer_email}</p>
                        </div>
                        <div className="flex shrink-0">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} size={14} className={n <= r.rating ? 'fill-bib-red text-bib-red' : 'text-bib-white/20'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-bib-gray leading-relaxed">{r.comment}</p>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => handleAprobarResena(r.id)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded text-xs font-medium uppercase tracking-wide transition-colors">Aprobar</button>
                        <button onClick={() => handleRechazarResena(r.id)} className="border border-bib-white/20 text-bib-gray hover:text-bib-red hover:border-bib-red px-4 py-1.5 rounded text-xs font-medium uppercase tracking-wide transition-colors">Rechazar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-bib-white uppercase tracking-widest mb-4">
                Publicadas ({resenasAprobadas.length})
              </h3>
              {resenasAprobadas.length === 0 ? (
                <p className="text-bib-gray text-sm">Todavía no hay reseñas publicadas.</p>
              ) : (
                <div className="space-y-3">
                  {resenasAprobadas.map(r => (
                    <div key={r.id} className="bg-bib-dark p-5 rounded border border-bib-white/10 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-bib-white text-sm">{r.customer_name}</p>
                        <div className="flex shrink-0">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} size={14} className={n <= r.rating ? 'fill-bib-red text-bib-red' : 'text-bib-white/20'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-bib-gray leading-relaxed">{r.comment}</p>
                      <button onClick={() => handleRechazarResena(r.id)} className="text-bib-red hover:text-bib-white text-xs uppercase tracking-wide">Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'Métricas' && (
          <div className="max-w-4xl mx-auto h-72 sm:h-96 bg-bib-dark p-4 sm:p-6 md:p-8 rounded border border-bib-white/10">
            <h3 className="text-sm md:text-base font-medium text-bib-white mb-4 md:mb-6 uppercase tracking-widest">Tendencia de Ventas</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={[...pedidos].reverse()}>
                <CartesianGrid stroke="#232323" strokeDasharray="3 3" />
                <XAxis stroke="#A8A8A0" dataKey="nombre_del_cliente" tick={{ fontSize: 10, fill: '#A8A8A0' }} interval="preserveStartEnd" />
                <YAxis stroke="#A8A8A0" tick={{ fontSize: 10, fill: '#A8A8A0' }} width={40} />
                <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#232323', borderRadius: '4px', color: '#F5F5F0', fontSize: '0.85rem' }} />
                <Line type="monotone" dataKey="total" stroke="#C4A278" strokeWidth={3} dot={{ r: 4, fill: '#C4A278' }} activeDot={{ r: 6, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>

      {pickerMode && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPickerMode(null)}>
          <div className="bg-bib-dark border border-bib-white/10 rounded p-4 md:p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium uppercase tracking-widest">
                {pickerMode === 'main' ? 'Elegir foto principal' : 'Elegir fotos adicionales (podés tocar varias)'}
              </h3>
              <button onClick={() => setPickerMode(null)} className="text-bib-gray hover:text-bib-white text-sm">Cerrar ✕</button>
            </div>

            {loadingStorage ? (
              <p className="text-bib-gray text-sm text-center py-8">Cargando fotos del storage...</p>
            ) : storageFiles.length === 0 ? (
              <p className="text-bib-gray text-sm text-center py-8">No se encontraron archivos en el storage.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                {storageFiles.map(f => {
                  const seleccionada = pickerMode === 'main'
                    ? editData.image_url === f.url
                    : editData.image_urls.includes(f.url);
                  return (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => elegirImagen(f.url)}
                      className={`relative aspect-square rounded overflow-hidden border-2 transition-all duration-200 ${
                        seleccionada
                          ? 'border-green-500'
                          : 'border-bib-white/10 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 hover:border-bib-white/30'
                      }`}
                    >
                      <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                      {seleccionada && (
                        <span className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {pickerMode === 'extra' && (
              <div className="pt-4 flex justify-end">
                <button onClick={() => setPickerMode(null)} className="bg-bib-red text-bib-white px-6 py-2 rounded font-medium text-sm uppercase tracking-wide">Listo</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}