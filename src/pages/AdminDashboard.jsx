import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, Check, X, Download, Plus, Trash2, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { siteConfig } from '../config/site';
import { CATEGORIES as CATEGORIAS_INICIALES } from '../config/categories';
import AdminCoupons from '../components/AdminCoupons';
import AdminFaqs from '../components/AdminFaqs';
import AdminCarritos from './AdminCarritos';
import { compressToWebp, compressManyToWebp } from '../utils/imageCompress';

export default function AdminDashboard() {
  const [view, setView] = useState('Inventario');
  const [session, setSession] = useState(null);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [grabados, setGrabados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [file, setFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  
  // Array de archivos para subida múltiple en grabados
  const [grabadoFiles, setGrabadoFiles] = useState([]);
  
  // Categorías Dinámicas
  const [categorias, setCategorias] = useState(CATEGORIAS_INICIALES);
  const [nuevaCategoriaForm, setNuevaCategoriaForm] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState(CATEGORIAS_INICIALES[0] || '');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  
  // Subcategorías Dinámicas
  const [subcategorias, setSubcategorias] = useState([]);
  const [categoriaExpandida, setCategoriaExpandida] = useState(null);
  const [nuevaSubcategoriaForm, setNuevaSubcategoriaForm] = useState('');
  
  const [busqueda, setBusqueda] = useState('');
  const [verArchivados, setVerArchivados] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [editId, setEditId] = useState(null);
  
  // Estado de edición extendido con Doble Precio (price_cash)
  const [editData, setEditData] = useState({
    name: '',
    price: '',
    price_cash: '',
    stock: 0,
    description: '',
    image_url: '',
    image_urls: [],
    personalizable: false,
    category: '',
    subcategory: '',
    descuento_porcentaje: 0
  });

  const [storageFiles, setStorageFiles] = useState([]);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [pickerMode, setPickerMode] = useState(null);

  // Configuración general del sitio (incluye Footer)
  const [settings, setSettings] = useState({
    quienes_somos: '',
    transferencia_alias: '',
    transferencia_cbu: '',
    transferencia_titular: '',
    mostrar_stock_bajo: true,
    umbral_stock_bajo: 5,
    telefono: '',
    email: '',
    instagram: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const navigate = useNavigate();

  useEffect(() => { 
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    fetchData(); 
  }, []);

  function handleExtraFilesChange(e) {
    const nuevos = Array.from(e.target.files).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      selected: true,
    }));
    setExtraFiles((prev) => [...prev, ...nuevos]);
    e.target.value = '';
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
    setTimeout(() => setMensaje(''), 3500);
  };

  async function fetchData() {
    const { data: p } = await supabase.from('productos').select('*');
    const { data: o } = await supabase.from('orders').select('*').order('creado_en', { ascending: false });
    const { data: r } = await supabase.from('resenas').select('*').order('created_at', { ascending: false });
    const { data: g } = await supabase.from('grabados').select('*').order('created_at', { ascending: false });
    const { data: s } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    
    // Carga de subcategorías
    const { data: subData } = await supabase.from('subcategorias').select('*');
    if (subData) setSubcategorias(subData);
    
    // Carga de categorías personalizadas desde la base de datos si existen
    const { data: catData } = await supabase.from('categorias').select('nombre').order('nombre', { ascending: true });
    
    if (catData && catData.length > 0) {
      const listaDB = catData.map(c => c.nombre);
      setCategorias(listaDB);
      if (!listaDB.includes(nuevaCategoria)) {
        setNuevaCategoria(listaDB[0]);
      }
    } else {
      setCategorias(CATEGORIAS_INICIALES);
    }

    setProductos(p || []);
    setPedidos(o || []);
    setResenas(r || []);
    setGrabados(g || []);
    
    if (s) {
      setSettings({
        quienes_somos: s.quienes_somos || '',
        transferencia_alias: s.transferencia_alias || '',
        transferencia_cbu: s.transferencia_cbu || '',
        transferencia_titular: s.transferencia_titular || '',
        mostrar_stock_bajo: s.mostrar_stock_bajo ?? true,
        umbral_stock_bajo: s.umbral_stock_bajo ?? 5,
        telefono: s.telefono || '',
        email: s.email || '',
        instagram: s.instagram || '',
      });
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    const catLimpia = nuevaCategoriaForm.trim();

    if (!catLimpia) {
      mostrarMensaje("El nombre de la categoría no puede estar vacío");
      return;
    }

    if (categorias.some(c => c.toLowerCase() === catLimpia.toLowerCase())) {
      mostrarMensaje("Esta categoría ya existe");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('categorias').insert([{ nombre: catLimpia }]);

    if (error) {
      setCategorias(prev => [...prev, catLimpia]);
      mostrarMensaje(`Categoría "${catLimpia}" agregada localmente`);
    } else {
      mostrarMensaje("Categoría agregada con éxito");
      fetchData();
    }
    setNuevaCategoriaForm('');
    setLoading(false);
  }

  async function handleDeleteCategory(catNombre) {
    const productosConEstaCat = productos.filter(p =>
      p.category &&
      p.category.trim().toLowerCase() === catNombre.trim().toLowerCase() &&
      !p.archivado
    );
    if (productosConEstaCat.length > 0) {
      mostrarMensaje(`No se puede eliminar: Hay ${productosConEstaCat.length} producto(s) asignado(s) a esta categoría.`);
      return;
    }

    if (!window.confirm(`¿Seguro que deseas eliminar la categoría "${catNombre}" y todas sus subcategorías?`)) return;

    setLoading(true);
    const { error } = await supabase.from('categorias').delete().eq('nombre', catNombre);

    if (error) {
      setCategorias(prev => prev.filter(c => c !== catNombre));
      mostrarMensaje(`Categoría "${catNombre}" removida`);
    } else {
      mostrarMensaje("Categoría eliminada con éxito");
      fetchData();
    }

    if (nuevaCategoria === catNombre) {
      setNuevaCategoria(categorias.find(c => c !== catNombre) || '');
    }
    setLoading(false);
  }

  async function handleAddSubcategory(e, categoriaPadre) {
    e.preventDefault();
    const subCatLimpia = nuevaSubcategoriaForm.trim();

    if (!subCatLimpia) {
      mostrarMensaje("El nombre de la subcategoría no puede estar vacío");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('subcategorias').insert([{ 
      categoria_nombre: categoriaPadre, 
      nombre: subCatLimpia 
    }]);

    if (error) {
      mostrarMensaje("Error al agregar subcategoría: " + error.message);
    } else {
      mostrarMensaje("Subcategoría agregada con éxito");
      setNuevaSubcategoriaForm('');
      fetchData();
    }
    setLoading(false);
  }

  async function handleDeleteSubcategory(id, nombre) {
    if (!window.confirm(`¿Seguro que deseas eliminar la subcategoría "${nombre}"?`)) return;

    setLoading(true);
    const { error } = await supabase.from('subcategorias').delete().eq('id', id);

    if (error) {
      mostrarMensaje("Error al eliminar subcategoría");
    } else {
      mostrarMensaje("Subcategoría eliminada con éxito");
      fetchData();
    }
    setLoading(false);
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    const { error } = await supabase
      .from('site_settings')
      .update({
        quienes_somos: settings.quienes_somos,
        transferencia_alias: settings.transferencia_alias,
        transferencia_cbu: settings.transferencia_cbu,
        transferencia_titular: settings.transferencia_titular,
        mostrar_stock_bajo: settings.mostrar_stock_bajo,
        umbral_stock_bajo: Math.max(1, parseInt(settings.umbral_stock_bajo) || 5),
        telefono: settings.telefono,
        email: settings.email,
        instagram: settings.instagram,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (error) mostrarMensaje("Error al guardar: " + error.message);
    else mostrarMensaje("Configuración guardada");
    setSavingSettings(false);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const name = formData.get('name')?.toString().trim();
    
    const price = Math.max(0, parseFloat(formData.get('price'))) || 0;
    const price_cash = Math.max(0, parseFloat(formData.get('price_cash'))) || 0;
    
    const stock = Math.max(0, parseInt(formData.get('stock'))) || 0;
    const category = formData.get('category');
    const subcategory = formData.get('subcategory') || null;
    const description = formData.get('description');
    const personalizable = formData.get('personalizable') === 'on';
    const destacado = formData.get('destacado') === 'on';
    const descuentoPorcentaje = Math.min(100, Math.max(0, parseFloat(formData.get('descuento_porcentaje')) || 0));

    let imageUrl = '';
    if (file) {
      const optimizedFile = await compressToWebp(file);
      const { data } = await supabase.storage.from('productos').upload(`${Date.now()}_${optimizedFile.name}`, optimizedFile);
      if (data) imageUrl = supabase.storage.from('productos').getPublicUrl(data.path).data.publicUrl;
    }

    const imageUrlsExtra = [];
    const seleccionadas = extraFiles.filter((item) => item.selected);
    const seleccionadasOptimizadas = await compressManyToWebp(seleccionadas.map((item) => item.file));
    for (const optimizedFile of seleccionadasOptimizadas) {
      const { data } = await supabase.storage.from('productos').upload(`${Date.now()}_${optimizedFile.name}`, optimizedFile);
      if (data) imageUrlsExtra.push(supabase.storage.from('productos').getPublicUrl(data.path).data.publicUrl);
    }

    const { error } = await supabase.from('productos').insert([{ 
      name, 
      price, 
      price_cash,
      stock, 
      category, 
      subcategory, 
      image_url: imageUrl, 
      image_urls: imageUrlsExtra, 
      description, 
      personalizable, 
      destacado,
      descuento_porcentaje: descuentoPorcentaje 
    }]);

    if (error) mostrarMensaje("Error: " + error.message);
    else {
      mostrarMensaje("Producto agregado con éxito");
      setFile(null);
      limpiarExtraFiles();
      e.target.reset();
      setNuevaCategoria(categorias[0] || '');
      fetchData();
    }
    setLoading(false);
  }

  async function handleAddGrabados(e) {
    e.preventDefault();
    if (!grabadoFiles || grabadoFiles.length === 0) return;
    setLoading(true);

    try {
      const optimizedFiles = await compressManyToWebp(grabadoFiles);
      const uploadPromises = optimizedFiles.map(async (f) => {
        const filePath = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${f.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('grabados')
          .upload(filePath, f);

        if (uploadError) throw uploadError;

        const imageUrl = supabase.storage.from('grabados').getPublicUrl(data.path).data.publicUrl;
        return supabase.from('grabados').insert([{ image_url: imageUrl }]);
      });

      await Promise.all(uploadPromises);

      mostrarMensaje(`¡Se subieron ${grabadoFiles.length} foto(s) correctamente!`);
      setGrabadoFiles([]);
      e.target.reset();
      fetchData();
    } catch (error) {
      mostrarMensaje("Error al subir grabados: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteGrabado(id) {
    if (!window.confirm("¿Eliminar esta foto de la galería?")) return;
    const { error } = await supabase.from('grabados').delete().eq('id', id);
    if (error) mostrarMensaje("Error: " + error.message);
    else {
      mostrarMensaje("Foto eliminada");
      fetchData();
    }
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
    try {
      setSavingEdit(true);
      const parsedPrice = parseFloat(editData.price);
      const parsedPriceCash = parseFloat(editData.price_cash);
      const parsedDiscount = parseFloat(editData.descuento_porcentaje);
      const parsedStock = parseInt(editData.stock);

      const { error } = await supabase.from('productos')
        .update({
          name: editData.name ? editData.name.trim() : '',
          price: isNaN(parsedPrice) ? 0 : Math.max(0, parsedPrice),
          price_cash: isNaN(parsedPriceCash) ? 0 : Math.max(0, parsedPriceCash),
          stock: isNaN(parsedStock) ? 0 : Math.max(0, parsedStock),
          description: editData.description || '',
          category: editData.category,
          subcategory: editData.subcategory || null,
          image_url: editData.image_url || '',
          image_urls: Array.isArray(editData.image_urls) ? editData.image_urls : [],
          personalizable: Boolean(editData.personalizable),
          destacado: Boolean(editData.destacado),
          descuento_porcentaje: isNaN(parsedDiscount) ? 0 : Math.min(100, Math.max(0, parsedDiscount)),
        })
        .eq('id', product.id);

      if (error) {
        mostrarMensaje("Error al actualizar: " + error.message);
      } else {
        mostrarMensaje("Producto actualizado con éxito");
        setEditId(null);
        await fetchData();
      }
    } catch (err) {
      mostrarMensaje("Ocurrió un error inesperado al guardar");
      console.error(err);
    } finally {
      setSavingEdit(false);
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
    if (!window.confirm("¿Eliminar este producto definitivo?")) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) mostrarMensaje("Error: " + error.message);
    else {
      mostrarMensaje("Producto eliminada");
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

  function handleExportarPedidos() {
    if (pedidos.length === 0) {
      mostrarMensaje("No hay pedidos para exportar");
      return;
    }

    const encabezados = [
      'Numero de pedido', 'Fecha', 'Cliente', 'DNI', 'Telefono', 'Email',
      'Direccion', 'Ciudad', 'Provincia', 'Codigo Postal',
      'Productos', 'Metodo de pago', 'Estado', 'Costo de envio', 'Descuento', 'Total',
    ];

    const SEPARADOR = ';';

    function escaparCampo(valor) {
      const texto = valor === null || valor === undefined ? '' : String(valor);
      if (texto.includes(SEPARADOR) || texto.includes('"') || texto.includes('\n')) {
        return `"${texto.replace(/"/g, '""')}"`;
      }
      return texto;
    }

    const filas = pedidos.map((o) => {
      const productosTexto = Array.isArray(o.productos)
        ? o.productos.map((p) => `${p.quantity}x ${p.name}`).join(' | ')
        : '';
      const fecha = o.creado_en
        ? new Date(o.creado_en).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';

      return [
        o.identificador,
        fecha,
        o.nombre_del_cliente,
        o.dni,
        o.telefono,
        o.email,
        o.direccion,
        o.ciudad,
        o.provincia,
        o.codigo_postal,
        productosTexto,
        o.metodo_pago === 'transferencia' ? 'Transferencia' : 'Mercado Pago',
        o.estado,
        o.costo_de_envio,
        o.descuento || 0,
        o.total,
      ].map(escaparCampo).join(SEPARADOR);
    });

    const csv = [encabezados.join(SEPARADOR), ...filas].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const hoy = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `pedidos_${siteConfig.businessName.toLowerCase().replace(/\s+/g, '_')}_${hoy}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    mostrarMensaje(`Exportados ${pedidos.length} pedidos`);
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

  const subcategoriasNueva = subcategorias
    .filter(sub => (sub.categoria_nombre || sub.categoria) === nuevaCategoria)
    .map(sub => sub.nombre);

  const subcategoriasEdit = subcategorias
    .filter(sub => (sub.categoria_nombre || sub.categoria) === editData.category)
    .map(sub => sub.nombre);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bib-black text-bib-white">
      <aside className="w-full md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r border-bib-white/10 p-4 md:p-6 flex flex-col shrink-0">
        <h1 className="text-lg md:text-xl mb-4 md:mb-12 uppercase tracking-widest font-medium">{siteConfig.businessName} Admin</h1>
        <nav className="flex md:flex-col gap-3 md:gap-0 md:space-y-6 flex-grow overflow-x-auto pb-2">
          {['Inventario', 'Categorías', 'Cupones', 'FAQs', 'Pedidos', 'Carritos', 'Reseñas', 'Grabados', 'Configuración', 'Métricas'].map(item => (
            <button key={item} onClick={() => setView(item)} className={`relative transition whitespace-nowrap text-sm uppercase tracking-widest text-left flex items-center gap-2 ${view === item ? 'text-bib-red font-medium' : 'text-bib-gray hover:text-bib-white'}`}>
              {item === 'Carritos' && <ShoppingCart size={16} />}
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
        {mensaje && <div className="bg-bib-red text-bib-white p-3 rounded mb-4 text-center text-sm uppercase tracking-widest transition-all">{mensaje}</div>}

        {view === 'Inventario' && (
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            <form onSubmit={handleAddProduct} className="max-w-4xl mx-auto bg-bib-dark p-5 md:p-8 rounded border border-bib-white/10 space-y-3 md:space-y-4">
              <h3 className="text-sm md:text-base mb-2 md:mb-4 uppercase tracking-widest font-medium">Nuevo Producto</h3>
              <input name="name" placeholder="Nombre" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base" required />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-bib-gray mb-1 px-1">Precio de Lista / Tarjeta ($)</label>
                  <input name="price" type="number" step="any" min="0" placeholder="Ej: 15000" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base" required />
                </div>
                <div>
                  <label className="block text-xs text-bib-gray mb-1 px-1">Precio Contado / Efectivo ($)</label>
                  <input name="price_cash" type="number" step="any" min="0" placeholder="Ej: 12500" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base" required />
                </div>
              </div>

              <div>
                <label className="block text-xs text-bib-gray mb-1 px-1">% de descuento (opcional, 0 = sin descuento)</label>
                <input name="descuento_porcentaje" type="number" step="any" min="0" max="100" placeholder="Ej: 15" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base" />
              </div>
              
              <input name="stock" type="number" min="0" placeholder="Stock" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base" required />
              <textarea name="description" placeholder="Descripción del producto" rows={3} className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base resize-none" />
              
              <select name="category" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base">
                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              
              {nuevaCategoria === 'MATES' ? (
                <select name="subcategory" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base">
                  <option value="">Sin subcategoría</option>
                  <option value="IMPERIALES">IMPERIALES</option>
                  <option value="CAMIONEROS">CAMIONEROS</option>
                  <option value="TORPEDOS">TORPEDOS</option>
                  <option value="ALGARROBOS">ALGARROBOS</option>
                  <option value="PAMPA">PAMPA</option>
                </select>
              ) : subcategoriasNueva.length > 0 && (
                <select name="subcategory" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base">
                  <option value="">Sin subcategoría</option>
                  {subcategoriasNueva.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              )}

              {nuevaCategoria === 'Yerbas' && subcategoriasNueva.length === 0 && (
                <input name="subcategory" placeholder="Marca de la yerba" className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-6 text-sm md:text-base" />
              )}
              
              <label className="flex items-center gap-2 text-sm text-bib-gray">
                <input type="checkbox" name="personalizable" className="w-4 h-4 accent-bib-red" />
                ¿Es personalizable / grabable?
              </label>

              <label className="flex items-center gap-2 text-sm text-bib-gray">
                <input type="checkbox" name="destacado" className="w-4 h-4 accent-bib-red" />
                ¿Mostrar en "Productos Destacados" de la home?
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
                        {item.selected ? (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500/90 text-white rounded-full w-4 h-4 flex items-center justify-center shadow">
                            <X size={10} strokeWidth={3} />
                          </span>
                        ) : (
                          <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => quitarExtraFile(i)}
                          className="absolute -bottom-1.5 -right-1.5 bg-bib-red text-white rounded-full w-4 h-4 text-[9px] leading-none flex items-center justify-center shadow"
                          title="Quitar esta foto"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button disabled={loading} className="bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black w-full px-8 py-3 rounded font-medium text-sm md:text-base uppercase tracking-widest transition-colors">GUARDAR</button>
            </form>

            <input type="text" placeholder="Buscar producto..." className="max-w-4xl mx-auto block w-full bg-bib-dark p-3 rounded border border-bib-white/20 px-6 mb-2 text-sm md:text-base" onChange={(e) => setBusqueda(e.target.value)} />

            <div className="max-w-4xl mx-auto flex gap-2 mb-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-auto md:px-0 scrollbar-hide">
              {['Todos', ...categorias].map(cat => (
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
                        {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>

                      {editData.category === 'MATES' ? (
                        <select className="w-full bg-bib-black p-2 rounded border border-bib-white/20 text-sm px-4 text-bib-white" value={editData.subcategory} onChange={(e) => setEditData({...editData, subcategory: e.target.value})}>
                          <option value="">Sin subcategoría</option>
                          <option value="IMPERIALES">IMPERIALES</option>
                          <option value="CAMIONEROS">CAMIONEROS</option>
                          <option value="TORPEDOS">TORPEDOS</option>
                          <option value="ALGARROBOS">ALGARROBOS</option>
                          <option value="PAMPA">PAMPA</option>
                        </select>
                      ) : subcategoriasEdit.length > 0 ? (
                        <select className="w-full bg-bib-black p-2 rounded border border-bib-white/20 text-sm px-4" value={editData.subcategory} onChange={(e) => setEditData({...editData, subcategory: e.target.value})}>
                          <option value="">Sin subcategoría</option>
                          {subcategoriasEdit.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                      ) : editData.category === 'Yerbas' && (
                        <input className="w-full bg-bib-black p-2 rounded border border-bib-white/20 text-sm px-4" placeholder="Marca de la yerba" value={editData.subcategory} onChange={(e) => setEditData({...editData, subcategory: e.target.value})} />
                      )}

                      <label className="flex items-center gap-2 text-xs text-bib-gray">
                        <input type="checkbox" checked={editData.personalizable} onChange={(e) => setEditData({...editData, personalizable: e.target.checked})} className="w-4 h-4 accent-bib-red" />
                        ¿Es personalizable / grabable?
                      </label>

                      <label className="flex items-center gap-2 text-xs text-bib-gray">
                        <input type="checkbox" checked={editData.destacado} onChange={(e) => setEditData({...editData, destacado: e.target.checked})} className="w-4 h-4 accent-bib-red" />
                        ¿Mostrar en "Productos Destacados" de la home?
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

                      <div className="space-y-2 pt-1">
                        <div className="flex gap-2">
                          <input className="bg-bib-black p-2 rounded border border-bib-white/20 w-1/2 text-sm px-3" placeholder="Precio Lista" value={editData.price} type="number" min="0" step="any" onChange={(e) => setEditData({...editData, price: e.target.value})} />
                          <input className="bg-bib-black p-2 rounded border border-bib-white/20 w-1/2 text-sm px-3" placeholder="Precio Efectivo" value={editData.price_cash} type="number" min="0" step="any" onChange={(e) => setEditData({...editData, price_cash: e.target.value})} />
                        </div>
                        <div className="flex gap-2">
                          <input className="bg-bib-black p-2 rounded border border-bib-white/20 w-1/2 text-sm px-3" placeholder="Stock" value={editData.stock} type="number" min="0" onChange={(e) => setEditData({...editData, stock: e.target.value})} />
                          <input className="bg-bib-black p-2 rounded border border-bib-white/20 w-1/2 text-sm px-3" placeholder="% dto" value={editData.descuento_porcentaje} type="number" min="0" max="100" onChange={(e) => setEditData({...editData, descuento_porcentaje: e.target.value})} />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button type="button" disabled={savingEdit} onClick={() => handleUpdate(p)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-xs font-medium uppercase tracking-wide flex-1 disabled:opacity-50">
                            {savingEdit ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button type="button" disabled={savingEdit} onClick={() => setEditId(null)} className="text-bib-gray border border-bib-white/10 px-3 py-2 rounded text-xs uppercase tracking-wide">Cancelar</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="aspect-video w-full rounded overflow-hidden bg-bib-black border border-bib-white/10">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1 h-full text-bib-white/20">
                            <span className="uppercase tracking-widest text-[9px]">Sin foto</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-3 flex-1">
                        <div className="min-w-0">
                          <p className="font-medium text-base md:text-lg text-bib-white">{p.name}</p>
                          {p.description && (
                            <p className="text-xs md:text-sm text-bib-gray mt-1 line-clamp-2">{p.description}</p>
                          )}
                        </div>
                        
                        <div className="space-y-1 bg-bib-black/50 p-2.5 rounded border border-bib-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-bib-gray uppercase tracking-wider">Lista / Tarjeta:</span>
                            <span className="font-medium text-sm text-bib-white">
                              ${p.price?.toLocaleString('es-AR')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-green-400 font-medium uppercase tracking-wider">Contado / Efec:</span>
                            <span className="font-semibold text-sm text-green-400">
                              ${(p.price_cash || p.price)?.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded text-xs border font-medium ${stockColor(p.stock ?? 0)}`}>
                            Stock: {p.stock ?? 0}
                          </span>
                          {p.descuento_porcentaje > 0 && (
                            <span className="px-2 py-1 rounded text-[10px] border border-green-700/40 bg-green-900/40 text-green-300 uppercase tracking-wide">{p.descuento_porcentaje}% OFF</span>
                          )}
                          {p.subcategory && (
                            <span className="px-2 py-1 rounded text-[10px] border border-bib-white/20 text-bib-gray uppercase tracking-wide">{p.subcategory}</span>
                          )}
                          {p.personalizable && (
                            <span className="px-2 py-1 rounded text-[10px] border border-bib-red/40 text-bib-red uppercase tracking-wide">Personalizable</span>
                          )}
                          {p.destacado && (
                            <span className="px-2 py-1 rounded text-[10px] border border-[#C4A278]/50 text-[#C4A278] uppercase tracking-wide">★ Destacado</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 pt-1 border-t border-bib-white/10 mt-1">
                        <button onClick={() => { setEditId(p.id); setEditData({ name: p.name, price: p.price, price_cash: p.price_cash || p.price, stock: p.stock, description: p.description || '', image_url: p.image_url || '', image_urls: Array.isArray(p.image_urls) ? p.image_urls : [], personalizable: p.personalizable === true, destacado: p.destacado === true, category: p.category, subcategory: p.subcategory || '', descuento_porcentaje: p.descuento_porcentaje || 0 }); }} className="text-blue-400 font-medium hover:text-blue-300 transition text-xs md:text-sm pt-2 uppercase tracking-wide">Editar</button>
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

        {view === 'Categorías' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-bib-dark p-4 rounded border border-bib-white/10 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-bib-white">¿Migrar subcategorías del código a la BD?</p>
                <p className="text-xs text-bib-gray">Pasa automáticamente las subcategorías estáticas a Supabase.</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  const subcategoriasEstaticas = {
                    "MATES": ["IMPERIALES", "ALGARROBOS", "CAMIONEROS", "TORPEDOS"],
                    "BOMBILLAS": ["PICOS DE LORO", "CLASICAS", "DESARMABLES"],
                    "BOMBILLONES": ["GRANDES", "STANDARD"],
                    "TERMOS": ["STANLEY", "ACERO INOXIDABLE"],
                    "CANASTAS": ["CUERO", "ECOCUERO", "TELA"],
                    "YERBAS": ["BALDO", "CANARIAS", "REI VERDE", "BARAO"],
                  };

                  let count = 0;
                  for (const [cat, subs] of Object.entries(subcategoriasEstaticas)) {
                    for (const sub of subs) {
                      await supabase.from('subcategorias').insert([
                        { categoria_nombre: cat, nombre: sub }
                      ]);
                      count++;
                    }
                  }
                  mostrarMensaje(`¡Se migraron ${count} subcategorías con éxito!`);
                  fetchData();
                  setLoading(false);
                }}
                disabled={loading}
                className="bg-[#C4A278] hover:bg-bib-white text-bib-black px-4 py-2 rounded text-xs font-medium uppercase tracking-wide transition-colors shrink-0"
              >
                Migrar subcategorías
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="bg-bib-dark p-5 md:p-8 rounded border border-bib-white/10 space-y-4">
              <h3 className="text-sm md:text-base uppercase tracking-widest font-medium">Crear Nueva Categoría Principal</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre de la categoría (ej: Bombillas, Cueros)"
                  className="flex-1 bg-bib-black p-3 rounded border border-bib-white/20 px-4 text-sm md:text-base"
                  value={nuevaCategoriaForm}
                  onChange={(e) => setNuevaCategoriaForm(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black px-6 py-3 rounded font-medium text-xs md:text-sm uppercase tracking-widest transition-colors flex items-center gap-2 shrink-0"
                >
                  <Plus size={16} /> Crear
                </button>
              </div>
            </form>

            <div className="bg-bib-dark p-5 md:p-8 rounded border border-bib-white/10 space-y-4">
              <h3 className="text-sm md:text-base uppercase tracking-widest font-medium">Categorías y Subcategorías</h3>
              <p className="text-xs text-bib-gray mb-4">Haz clic en una categoría para gestionar sus subcategorías.</p>
              
              <div className="divide-y divide-bib-white/10">
                {categorias.map(cat => {
                  const cantidadProductos = productos.filter(p =>
                    p.category &&
                    p.category.trim().toLowerCase() === cat.trim().toLowerCase() &&
                    !p.archivado
                  ).length;
                  
                  const isExpanded = categoriaExpandida === cat;
                  const subsDeEstaCat = subcategorias.filter(sub => (sub.categoria_nombre || sub.categoria) === cat);

                  return (
                    <div key={cat} className="py-3 flex flex-col transition-all">
                      <div className="flex items-center justify-between">
                        <div 
                          className="cursor-pointer flex-1 group"
                          onClick={() => setCategoriaExpandida(isExpanded ? null : cat)}
                        >
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-bib-white group-hover:text-[#C4A278] transition-colors">{cat}</p>
                            {isExpanded ? <ChevronUp size={16} className="text-[#C4A278]" /> : <ChevronDown size={16} className="text-bib-gray" />}
                          </div>
                          <p className="text-xs text-bib-gray">{cantidadProductos} producto(s) asignados • {subsDeEstaCat.length} subcategorías</p>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="text-bib-gray hover:text-bib-red p-2 rounded border border-bib-white/10 hover:border-bib-red transition shrink-0 ml-4"
                          title="Eliminar categoría"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pl-4 border-l-2 border-[#C4A278]/40 space-y-3 bg-bib-black/30 p-3 rounded-r-lg">
                          <h4 className="text-xs uppercase tracking-widest text-bib-gray font-bold">Subcategorías de {cat}</h4>
                          
                          {subsDeEstaCat.length > 0 ? (
                            <ul className="space-y-2">
                              {subsDeEstaCat.map(sub => (
                                <li key={sub.id} className="flex items-center justify-between bg-bib-black px-3 py-2 rounded border border-bib-white/5">
                                  <span className="text-sm text-bib-white">{sub.nombre}</span>
                                  <button 
                                    onClick={() => handleDeleteSubcategory(sub.id, sub.nombre)}
                                    className="text-bib-gray hover:text-bib-red transition"
                                  >
                                    <X size={14} />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-bib-gray/50 italic">No hay subcategorías aún.</p>
                          )}

                          <form onSubmit={(e) => handleAddSubcategory(e, cat)} className="flex gap-2 mt-3">
                            <input
                              type="text"
                              placeholder="Nueva subcategoría..."
                              className="flex-1 bg-bib-black p-2 rounded border border-bib-white/20 px-3 text-sm"
                              value={nuevaSubcategoriaForm}
                              onChange={(e) => setNuevaSubcategoriaForm(e.target.value)}
                              required
                            />
                            <button
                              type="submit"
                              disabled={loading}
                              className="bg-[#C4A278] hover:bg-bib-white text-bib-black px-3 py-2 rounded font-medium text-xs uppercase tracking-wide transition-colors shrink-0"
                            >
                              Agregar
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {view === 'Cupones' && (
          <div className="max-w-4xl mx-auto">
            <AdminCoupons token={session?.access_token} />
          </div>
        )}

        {view === 'FAQs' && (
          <div className="max-w-4xl mx-auto">
            <AdminFaqs token={session?.access_token} />
          </div>
        )}

        {view === 'Pedidos' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleExportarPedidos}
                className="flex items-center gap-2 bg-bib-dark border border-bib-white/20 hover:border-bib-red text-bib-white px-4 py-2 rounded text-xs font-medium uppercase tracking-wide transition-colors"
              >
                <Download size={14} />
                Exportar a Excel
              </button>
            </div>

            {pedidos.length === 0 && (
              <div className="bg-bib-dark p-8 rounded border border-bib-white/10 text-center text-bib-gray">
                Todavía no hay pedidos.
              </div>
            )}

            {pedidos.map(o => {
              const esTransferenciaPendiente = o.metodo_pago === 'transferencia' && o.estado === 'pendiente';
              return (
                <div key={o.identificador} className={`bg-bib-dark p-5 md:p-6 rounded border space-y-3 ${esTransferenciaPendiente ? 'border-yellow-700/40' : 'border-bib-white/10'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-base md:text-lg text-bib-white">{o.nombre_del_cliente}</p>
                      <p className="text-xs md:text-sm text-bib-gray">{o.telefono}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-3 py-1 rounded text-xs border ${estadoColor(o.estado)}`}>
                        {o.estado}
                      </span>
                      {o.metodo_pago === 'transferencia' && (
                        <span className="px-3 py-1 rounded text-xs border border-bib-white/20 text-bib-gray uppercase tracking-wide">
                          Transferencia
                        </span>
                      )}
                    </div>
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
                      {o.descuento > 0 && ` · Descuento: -$${Number(o.descuento).toLocaleString('es-AR')}`}
                    </div>
                    <div className="font-medium text-lg md:text-xl text-bib-red">
                      ${Number(o.total).toLocaleString('es-AR')}
                    </div>
                  </div>

                  {esTransferenciaPendiente && (
                    <button
                      onClick={() => handleUpdateOrderStatus(o.identificador, 'pagado')}
                      className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-xs font-medium uppercase tracking-wide transition-colors"
                    >
                      Confirmar transferencia recibida
                    </button>
                  )}

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
              );
            })}
          </div>
        )}

        {view === 'Carritos' && (
          <div className="max-w-5xl mx-auto">
            <AdminCarritos />
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

        {view === 'Grabados' && (
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <form onSubmit={handleAddGrabados} className="max-w-2xl mx-auto bg-bib-dark p-5 md:p-8 rounded border border-bib-white/10 space-y-3 md:space-y-4">
              <h3 className="text-sm md:text-base mb-2 md:mb-4 uppercase tracking-widest font-medium">Fotos de grabados</h3>
              <div className="flex flex-col items-center gap-2">
                <input
                  type="file"
                  id="grabadoFileInput"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => setGrabadoFiles(Array.from(e.target.files))}
                />
                <label htmlFor="grabadoFileInput" className="cursor-pointer bg-bib-black px-6 py-2 rounded border border-bib-white/20 hover:border-bib-red transition text-xs md:text-sm text-center break-all">
                  {grabadoFiles.length > 0
                    ? `${grabadoFiles.length} foto(s) seleccionada(s)`
                    : "Seleccionar fotos"}
                </label>
              </div>
              <button
                disabled={loading || grabadoFiles.length === 0}
                className="bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black w-full px-8 py-3 rounded font-medium text-sm md:text-base uppercase tracking-widest transition-colors disabled:opacity-40"
              >
                {loading ? "SUBIENDO..." : `SUBIR ${grabadoFiles.length || ""} A LA GALERÍA`}
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {grabados.map((g) => (
                <div key={g.id} className="relative group rounded overflow-hidden border border-bib-white/10 aspect-square">
                  <img src={g.image_url} alt="Grabado" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDeleteGrabado(g.id)}
                    className="absolute top-2 right-2 bg-bib-red text-bib-white rounded-full w-7 h-7 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {grabados.length === 0 && (
              <p className="text-center text-bib-gray py-8">Todavía no subiste ninguna foto.</p>
            )}
          </div>
        )}

        {view === 'Configuración' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSaveSettings} className="space-y-6 md:space-y-8">
              <div className="bg-bib-dark p-5 md:p-8 rounded border border-bib-white/10 space-y-3 md:space-y-4">
                <h3 className="text-sm md:text-base uppercase tracking-widest font-medium">Datos de Contacto (Footer)</h3>
                <p className="text-xs text-bib-gray">Estos datos aparecerán reflejados en el pie de página de la tienda.</p>
                <div>
                  <label className="block text-xs text-bib-gray mb-1">Teléfono</label>
                  <input
                    placeholder="Ej: 11 3258 5236"
                    className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-4 text-sm md:text-base"
                    value={settings.telefono}
                    onChange={(e) => setSettings({ ...settings, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-bib-gray mb-1">Correo electrónico</label>
                  <input
                    placeholder="Ej: ivanezequieljure1997@hotmail.com"
                    className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-4 text-sm md:text-base"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-bib-gray mb-1">Instagram</label>
                  <input
                    placeholder="Ej: @bibmates_"
                    className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-4 text-sm md:text-base"
                    value={settings.instagram}
                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-bib-dark p-5 md:p-8 rounded border border-bib-white/10 space-y-3 md:space-y-4">
                <h3 className="text-sm md:text-base uppercase tracking-widest font-medium">Quiénes somos</h3>
                <p className="text-xs text-bib-gray">Este texto aparece en la página "Nosotros" de la tienda.</p>
                <textarea
                  rows={6}
                  placeholder="Contá la historia del negocio..."
                  className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-4 text-sm md:text-base resize-none"
                  value={settings.quienes_somos}
                  onChange={(e) => setSettings({ ...settings, quienes_somos: e.target.value })}
                />
              </div>

              <div className="bg-bib-dark p-5 md:p-8 rounded border border-bib-white/10 space-y-3 md:space-y-4">
                <h3 className="text-sm md:text-base uppercase tracking-widest font-medium">Datos de transferencia</h3>
                <p className="text-xs text-bib-gray">Estos datos se muestran al cliente cuando elige pagar por transferencia.</p>
                <input
                  placeholder="Alias"
                  className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-4 text-sm md:text-base"
                  value={settings.transferencia_alias}
                  onChange={(e) => setSettings({ ...settings, transferencia_alias: e.target.value })}
                />
                <input
                  placeholder="CBU / CVU"
                  className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-4 text-sm md:text-base"
                  value={settings.transferencia_cbu}
                  onChange={(e) => setSettings({ ...settings, transferencia_cbu: e.target.value })}
                />
                <input
                  placeholder="Titular de la cuenta"
                  className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-4 text-sm md:text-base"
                  value={settings.transferencia_titular}
                  onChange={(e) => setSettings({ ...settings, transferencia_titular: e.target.value })}
                />
              </div>

              <div className="bg-bib-dark p-5 md:p-8 rounded border border-bib-white/10 space-y-3 md:space-y-4">
                <h3 className="text-sm md:text-base uppercase tracking-widest font-medium">Cartel de "últimas unidades"</h3>
                <label className="flex items-center gap-3 text-sm text-bib-white cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={settings.mostrar_stock_bajo}
                    onChange={(e) => setSettings({ ...settings, mostrar_stock_bajo: e.target.checked })}
                    className="w-4 h-4 accent-bib-red cursor-pointer"
                  />
                  Mostrar el cartel cuando queda poco stock
                </label>
                {settings.mostrar_stock_bajo && (
                  <div>
                    <label className="text-xs text-bib-gray uppercase tracking-wide">Mostrarlo cuando quedan menos de:</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-bib-black p-3 rounded border border-bib-white/20 px-4 text-sm md:text-base mt-1"
                      value={settings.umbral_stock_bajo}
                      onChange={(e) => setSettings({ ...settings, umbral_stock_bajo: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <button disabled={savingSettings} className="bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black w-full px-8 py-3 rounded font-medium text-sm md:text-base uppercase tracking-widest transition-colors disabled:opacity-40">
                {savingSettings ? 'Guardando...' : 'GUARDAR CONFIGURACIÓN'}
              </button>
            </form>
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
                {pickerMode === 'main' ? 'Elegir foto principal' : 'Elegir fotos adicionales'}
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
                      {seleccionada ? (
                        <span className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full w-5 h-5 flex items-center justify-center shadow">
                          <X size={12} strokeWidth={3} />
                        </span>
                      ) : pickerMode === 'extra' && (
                        <span className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow">
                          <Check size={12} strokeWidth={3} />
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