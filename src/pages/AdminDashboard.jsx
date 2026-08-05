import React from 'react';
import { 
  Package, ShoppingBag, FolderTree, Image as ImageIcon, Settings, LogOut, 
  Search, Plus, Eye, Edit3, Trash2, ShieldCheck, Check, X, ShieldAlert 
} from 'lucide-react';

export default function AdminDashboard({
  currentView = 'productos',
  setCurrentView = () => {},
  setIsAuthenticated = () => {},
  searchTerm = '',
  setSearchTerm = () => {},
  fichasMostradas = [],
  productosMostrados = [],
  setIsProductModalOpen = () => {},
  isProductModalOpen = false,
  setIsCategoryModalOpen = () => {},
  isCategoryModalOpen = false,
  setFichaForm = () => {},
  fichaForm = { id: null, titulo: '', categoria: '', pdfUrl: '', fecha: '' },
  categories = [],
  categoryFilter = 'TODAS',
  setCategoryFilter = () => {},
  orders = [],
  updateOrderStatus = () => {},
  handleOpenEditFicha = () => {},
  handleDeleteFicha = () => {},
  setIsMediaModalOpen = () => {},
  isMediaModalOpen = false,
  setMediaForm = () => {},
  mediaForm = { titulo: '', url: '' },
  archivosGuardados = [],
  eliminarImagen = () => {},
  settings = { umbral_stock_bajo: 5 },
  setSettings = () => {},
  saveSettings = () => {},
  isSubmittingSettings = false,
  setIsCategoryManagerOpen = () => {},
  isCategoryManagerOpen = false,
  handleEditProduct = () => {},
  handleDeleteProduct = () => {},
  isPickerOpen = false,
  setIsPickerOpen = () => {},
  pickerMode = 'main',
  extraTempSelection = [],
  setExtraTempSelection = () => {},
  openMainPicker = () => {},
  handleUploadAndSelectFile = () => {},
  productForm = { id: null, titulo: '', descripcion: '', categoria: '', sku: '', precio: '', stock: '', imagen: '', imagenes_extra: [] },
  setProductForm = () => {},
  confirmExtraSelection = () => {},
  handleSaveProduct = () => {},
  handleSaveFicha = () => {},
  handleUploadMedia = () => {},
  handleAddCategory = () => {},
  handleDeleteCategory = () => {},
  newCategoryName = '',
  setNewCategoryName = () => {}
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bib-black font-sans text-bib-white text-sm">
      {/* SIDEBAR NAVEGACIÓN */}
      <aside className="w-full md:w-64 bg-bib-dark flex flex-col justify-between border-b md:border-b-0 md:border-r border-bib-dark-3">
        <div>
          <div className="p-6 border-b border-bib-dark-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-bib-red flex items-center justify-center font-bold text-bib-white text-lg shadow-sm">
              B
            </div>
            <div>
              <h1 className="font-bold text-bib-white tracking-wide text-base leading-none">BIB S.A.</h1>
              <span className="text-[10px] text-bib-gray font-mono uppercase tracking-wider">Panel Admin</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {[
              { id: 'productos', label: 'Productos', icon: Package },
              { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
              { id: 'fichas', label: 'Fichas Técnicas', icon: FolderTree },
              { id: 'multimedia', label: 'Multimedia', icon: ImageIcon },
              { id: 'configuracion', label: 'Configuración', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                    active 
                      ? 'bg-bib-red text-bib-white shadow-md' 
                      : 'text-bib-white/70 hover:bg-bib-dark-2 hover:text-bib-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-bib-dark-3">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs md:text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
        {/* VISTA 1: PRODUCTOS */}
        {currentView === 'productos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bib-dark p-4 md:p-6 rounded-xl border border-bib-dark-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-bib-white">Catálogo de Productos</h2>
                <p className="text-xs md:text-sm text-bib-gray mt-1">Gestiona el inventario, imágenes y detalles técnicos.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-bib-dark-2 hover:bg-bib-dark-3 text-bib-white border border-bib-dark-3 px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all"
                >
                  <FolderTree size={16} />
                  <span>Categorías</span>
                </button>
                <button
                  onClick={() => {
                    setProductForm({ id: null, titulo: '', descripcion: '', categoria: '', sku: '', precio: '', stock: '', imagen: '', imagenes_extra: [] });
                    setIsProductModalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-bib-red hover:bg-bib-red/90 text-bib-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all shadow-sm"
                >
                  <Plus size={16} />
                  <span>Nuevo Producto</span>
                </button>
              </div>
            </div>

            {/* FILTROS */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bib-gray" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por título, SKU o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bib-dark border border-bib-dark-3 rounded-lg text-bib-white text-xs md:text-sm focus:outline-none focus:border-bib-red transition-colors"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-bib-dark border border-bib-dark-3 rounded-lg px-4 py-2.5 text-bib-white text-xs md:text-sm focus:outline-none focus:border-bib-red transition-colors min-w-[180px]"
              >
                <option value="TODAS">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* TABLA PRODUCTOS */}
            <div className="bg-bib-dark rounded-xl border border-bib-dark-3 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-bib-dark-3 bg-bib-dark-2/50 text-[11px] md:text-xs font-semibold text-bib-gray uppercase tracking-wider">
                      <th className="p-4">Producto</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Precio</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bib-dark-3 text-xs md:text-sm">
                    {productosMostrados.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-bib-gray">
                          No se encontraron productos disponibles.
                        </td>
                      </tr>
                    ) : (
                      productosMostrados.map((p) => {
                        const esBajoStock = p.stock <= (settings.umbral_stock_bajo || 5);
                        return (
                          <tr key={p.id} className="hover:bg-bib-dark-2/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.imagen || 'https://via.placeholder.com/80'}
                                  alt={p.titulo}
                                  className="w-10 h-10 rounded-lg object-cover bg-bib-dark-2 border border-bib-dark-3 flex-shrink-0"
                                />
                                <div>
                                  <div className="font-semibold text-bib-white line-clamp-1">{p.titulo}</div>
                                  <div className="text-[11px] text-bib-gray line-clamp-1">{p.descripcion}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 bg-bib-dark-2 rounded-full text-[11px] font-medium text-bib-white/80 border border-bib-dark-3">
                                {p.categoria}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-xs text-bib-gray whitespace-nowrap">{p.sku || '-'}</td>
                            <td className="p-4 font-semibold text-bib-white whitespace-nowrap">
                              ${Number(p.precio).toLocaleString('es-AR')}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                esBajoStock 
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {esBajoStock && <ShieldAlert size={12} />}
                                {p.stock} un.
                              </span>
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditProduct(p)}
                                  className="p-2 text-bib-gray hover:text-bib-white hover:bg-bib-dark-2 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-2 text-bib-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: PEDIDOS */}
        {currentView === 'pedidos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-bib-dark p-4 md:p-6 rounded-xl border border-bib-dark-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-bib-white">Gestión de Pedidos</h2>
                <p className="text-xs md:text-sm text-bib-gray mt-1">Revisa y actualiza el estado de las compras realizadas.</p>
              </div>
            </div>

            <div className="grid gap-4">
              {orders.length === 0 ? (
                <div className="bg-bib-dark p-8 rounded-xl border border-bib-dark-3 text-center text-bib-gray">
                  No hay pedidos registrados.
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="bg-bib-dark p-5 rounded-xl border border-bib-dark-3 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-bib-dark-3 pb-3">
                      <div>
                        <span className="font-mono text-xs text-bib-red font-bold">#{o.id}</span>
                        <h3 className="font-bold text-bib-white text-base">{o.cliente}</h3>
                        <p className="text-xs text-bib-gray">{o.email} • {o.fecha}</p>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="font-bold text-base text-bib-white">${Number(o.total).toLocaleString('es-AR')}</span>
                        <select
                          value={o.estado}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none ${
                            o.estado === 'Completado'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : o.estado === 'Pendiente'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          <option value="Pendiente" className="bg-bib-dark text-bib-white">Pendiente</option>
                          <option value="En Proceso" className="bg-bib-dark text-bib-white">En Proceso</option>
                          <option value="Completado" className="bg-bib-dark text-bib-white">Completado</option>
                          <option value="Cancelado" className="bg-bib-dark text-bib-white">Cancelado</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 bg-bib-dark-2/40 p-3 rounded-lg border border-bib-dark-3/50">
                      {o.productos.map((item, i) => (
                        <div key={item.id || `${o.id}-${i}`} className="flex justify-between text-xs md:text-sm text-bib-white">
                          <span>
                            <span className="font-semibold text-bib-red">{item.cantidad || 1}x</span> {item.name || item.titulo}
                          </span>
                          <span className="text-bib-gray">${Number(item.price || item.precio).toLocaleString('es-AR')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* VISTA 3: FICHAS TÉCNICAS */}
        {currentView === 'fichas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bib-dark p-4 md:p-6 rounded-xl border border-bib-dark-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-bib-white">Fichas Técnicas</h2>
                <p className="text-xs md:text-sm text-bib-gray mt-1">Sube y organiza la documentación en PDF para los productos.</p>
              </div>
              <button
                onClick={() => {
                  setFichaForm({ id: null, titulo: '', categoria: '', pdfUrl: '', fecha: '' });
                  setIsCategoryModalOpen(true);
                }}
                className="flex items-center gap-2 bg-bib-red hover:bg-bib-red/90 text-bib-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all shadow-sm"
              >
                <Plus size={16} />
                <span>Nueva Ficha</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fichasMostradas.length === 0 ? (
                <div className="col-span-full bg-bib-dark p-8 rounded-xl border border-bib-dark-3 text-center text-bib-gray">
                  No hay fichas técnicas disponibles.
                </div>
              ) : (
                fichasMostradas.map((f) => (
                  <div key={f.id} className="bg-bib-dark p-5 rounded-xl border border-bib-dark-3 flex flex-col justify-between hover:border-bib-dark-2 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-bib-dark-2 rounded text-[10px] font-semibold text-bib-gray border border-bib-dark-3">
                          {f.categoria}
                        </span>
                        <span className="text-[10px] text-bib-gray">{f.fecha}</span>
                      </div>
                      <h3 className="font-bold text-bib-white text-base leading-snug line-clamp-2">{f.titulo}</h3>
                    </div>

                    <div className="pt-4 mt-4 border-t border-bib-dark-3 flex items-center justify-between gap-2">
                      <a
                        href={f.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-bib-red hover:underline font-medium"
                      >
                        <Eye size={14} /> Ver Documento
                      </a>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditFicha(f)}
                          className="p-1.5 text-bib-gray hover:text-bib-white rounded transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteFicha(f.id)}
                          className="p-1.5 text-bib-gray hover:text-red-400 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VISTA 4: MULTIMEDIA */}
        {currentView === 'multimedia' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bib-dark p-4 md:p-6 rounded-xl border border-bib-dark-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-bib-white">Biblioteca Multimedia</h2>
                <p className="text-xs md:text-sm text-bib-gray mt-1">Administra los recursos gráficos almacenados.</p>
              </div>
              <button
                onClick={() => {
                  setMediaForm({ titulo: '', url: '' });
                  setIsMediaModalOpen(true);
                }}
                className="flex items-center gap-2 bg-bib-red hover:bg-bib-red/90 text-bib-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all shadow-sm"
              >
                <Plus size={16} />
                <span>Subir Imagen</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {archivosGuardados.length === 0 ? (
                <div className="col-span-full bg-bib-dark p-8 rounded-xl border border-bib-dark-3 text-center text-bib-gray">
                  La biblioteca está vacía.
                </div>
              ) : (
                archivosGuardados.map((img, idx) => (
                  <div key={idx} className="group relative bg-bib-dark rounded-xl border border-bib-dark-3 overflow-hidden shadow-sm hover:border-bib-dark-2 transition-all">
                    <img
                      src={img.url || img}
                      alt={img.titulo || `Archivo ${idx}`}
                      className="w-full h-36 object-cover bg-bib-dark-2"
                    />
                    <div className="absolute inset-0 bg-bib-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        onClick={() => eliminarImagen(img.id || idx)}
                        className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                        title="Eliminar de la biblioteca"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VISTA 5: CONFIGURACIÓN */}
        {currentView === 'configuracion' && (
          <div className="space-y-6">
            <div className="bg-bib-dark p-4 md:p-6 rounded-xl border border-bib-dark-3">
              <h2 className="text-xl md:text-2xl font-bold text-bib-white">Configuración General</h2>
              <p className="text-xs md:text-sm text-bib-gray mt-1">Ajusta los parámetros operativos de la plataforma.</p>
            </div>

            <div className="bg-bib-dark p-6 rounded-xl border border-bib-dark-3 space-y-6 max-w-2xl">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-bib-gray">
                  Umbral de Stock Bajo
                </label>
                <p className="text-xs text-bib-gray/80">
                  Las alertas de stock crítico se activarán cuando un producto tenga una cantidad igual o inferior a este valor.
                </p>
                <input
                  type="number"
                  min="1"
                  value={settings.umbral_stock_bajo}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    umbral_stock_bajo: parseInt(e.target.value, 10) || 0 
                  })}
                  className="w-full max-w-xs px-4 py-2.5 bg-bib-dark-2 border border-bib-dark-3 rounded-lg text-bib-white focus:outline-none focus:border-bib-red transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-bib-dark-3">
                <button
                  onClick={saveSettings}
                  disabled={isSubmittingSettings}
                  className="flex items-center gap-2 bg-bib-red hover:bg-bib-red/90 disabled:opacity-50 text-bib-white px-6 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all shadow-sm"
                >
                  <ShieldCheck size={18} />
                  <span>{isSubmittingSettings ? 'Guardando...' : 'Guardar Ajustes'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: PRODUCTO */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-bib-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bib-dark border border-bib-dark-3 rounded-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-bib-dark-3 pb-3">
              <h3 className="text-lg font-bold text-bib-white">
                {productForm.id ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-bib-gray hover:text-bib-white">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-bib-gray font-medium">Título</label>
                <input
                  type="text"
                  value={productForm.titulo}
                  onChange={(e) => setProductForm({ ...productForm, titulo: e.target.value })}
                  className="w-full bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                />
              </div>
              <div>
                <label className="text-xs text-bib-gray font-medium">Descripción</label>
                <textarea
                  value={productForm.descripcion}
                  onChange={(e) => setProductForm({ ...productForm, descripcion: e.target.value })}
                  rows={3}
                  className="w-full bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-bib-gray font-medium">Categoría</label>
                  <select
                    value={productForm.categoria}
                    onChange={(e) => setProductForm({ ...productForm, categoria: e.target.value })}
                    className="w-full bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-bib-gray font-medium">SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-bib-gray font-medium">Precio ($)</label>
                  <input
                    type="number"
                    value={productForm.precio}
                    onChange={(e) => setProductForm({ ...productForm, precio: e.target.value })}
                    className="w-full bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                  />
                </div>
                <div>
                  <label className="text-xs text-bib-gray font-medium">Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-bib-gray font-medium">Imagen Principal</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={productForm.imagen}
                    onChange={(e) => setProductForm({ ...productForm, imagen: e.target.value })}
                    placeholder="URL de la imagen"
                    className="flex-1 bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                  />
                  <button
                    type="button"
                    onClick={openMainPicker}
                    className="bg-bib-dark-2 hover:bg-bib-dark-3 text-bib-white border border-bib-dark-3 px-3 py-2 rounded-lg text-xs"
                  >
                    Buscar
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-bib-dark-3 flex justify-end gap-2">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-bib-gray hover:text-bib-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                className="px-4 py-2 bg-bib-red hover:bg-bib-red/90 text-bib-white rounded-lg text-xs font-semibold"
              >
                Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GESTOR CATEGORÍAS */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-50 bg-bib-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bib-dark border border-bib-dark-3 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-bib-dark-3 pb-3">
              <h3 className="text-lg font-bold text-bib-white">Gestión de Categorías</h3>
              <button onClick={() => setIsCategoryManagerOpen(false)} className="text-bib-gray hover:text-bib-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nueva categoría..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
              />
              <button
                onClick={handleAddCategory}
                className="bg-bib-red hover:bg-bib-red/90 text-bib-white px-3 py-2 rounded-lg text-xs font-semibold"
              >
                Añadir
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((c) => (
                <div key={c.id || c.name} className="flex justify-between items-center bg-bib-dark-2/50 p-2.5 rounded-lg border border-bib-dark-3">
                  <span className="text-xs text-bib-white">{c.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(c.id || c.name)}
                    className="text-bib-gray hover:text-red-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FICHA TÉCNICA */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-bib-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bib-dark border border-bib-dark-3 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-bib-dark-3 pb-3">
              <h3 className="text-lg font-bold text-bib-white">
                {fichaForm.id ? 'Editar Ficha Técnica' : 'Nueva Ficha Técnica'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-bib-gray hover:text-bib-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-bib-gray font-medium">Título del Documento</label>
                <input
                  type="text"
                  value={fichaForm.titulo}
                  onChange={(e) => setFichaForm({ ...fichaForm, titulo: e.target.value })}
                  className="w-full bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                />
              </div>
              <div>
                <label className="text-xs text-bib-gray font-medium">Categoría</label>
                <input
                  type="text"
                  value={fichaForm.categoria}
                  onChange={(e) => setFichaForm({ ...fichaForm, categoria: e.target.value })}
                  className="w-full bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                />
              </div>
              <div>
                <label className="text-xs text-bib-gray font-medium">URL del PDF</label>
                <input
                  type="text"
                  value={fichaForm.pdfUrl}
                  onChange={(e) => setFichaForm({ ...fichaForm, pdfUrl: e.target.value })}
                  className="w-full bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-bib-dark-3 flex justify-end gap-2">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-bib-gray hover:text-bib-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFicha}
                className="px-4 py-2 bg-bib-red hover:bg-bib-red/90 text-bib-white rounded-lg text-xs font-semibold"
              >
                Guardar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SUBIR MULTIMEDIA */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-bib-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bib-dark border border-bib-dark-3 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-bib-dark-3 pb-3">
              <h3 className="text-lg font-bold text-bib-white">Subir Imagen</h3>
              <button onClick={() => setIsMediaModalOpen(false)} className="text-bib-gray hover:text-bib-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-bib-gray font-medium">Título/Etiqueta</label>
                <input
                  type="text"
                  value={mediaForm.titulo}
                  onChange={(e) => setMediaForm({ ...mediaForm, titulo: e.target.value })}
                  className="w-full bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                />
              </div>
              <div>
                <label className="text-xs text-bib-gray font-medium">URL de la Imagen</label>
                <input
                  type="text"
                  value={mediaForm.url}
                  onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                  className="w-full bg-bib-dark-2 border border-bib-dark-3 rounded-lg px-3 py-2 text-bib-white text-xs focus:outline-none focus:border-bib-red"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-bib-dark-3 flex justify-end gap-2">
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-bib-gray hover:text-bib-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadMedia}
                className="px-4 py-2 bg-bib-red hover:bg-bib-red/90 text-bib-white rounded-lg text-xs font-semibold"
              >
                Guardar Imagen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: SELECTOR DE IMÁGENES (IMAGE PICKER) */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-bib-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bib-dark border border-bib-dark-3 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-bib-dark-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-bib-white text-base">
                  {pickerMode === 'main' ? 'Seleccionar Imagen Principal' : 'Añadir Imágenes Galerías'}
                </h3>
                <p className="text-xs text-bib-gray">Elige archivos existentes o sube uno nuevo.</p>
              </div>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="p-1.5 text-bib-gray hover:text-bib-white rounded-lg hover:bg-bib-dark-2 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-bib-dark-3 bg-bib-dark-2/30">
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-bib-dark-3 hover:border-bib-red/50 rounded-lg p-3 text-xs text-bib-gray hover:text-bib-white cursor-pointer transition-colors">
                <Plus size={16} />
                <span>Subir nuevo archivo al servidor</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleUploadAndSelectFile(file);
                  }}
                />
              </label>
            </div>

            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {archivosGuardados.map((item, idx) => {
                const url = item.url || item;
                const estaEnMain = productForm.imagen === url;
                const estaEnExtra = (productForm.imagenes_extra || []).includes(url) || extraTempSelection.includes(url);
                const seleccionada = pickerMode === 'main' ? estaEnMain : estaEnExtra;

                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => {
                      if (pickerMode === 'main') {
                        setProductForm({ ...productForm, imagen: url });
                        setIsPickerOpen(false);
                      } else {
                        if (extraTempSelection.includes(url)) {
                          setExtraTempSelection(extraTempSelection.filter((u) => u !== url));
                        } else {
                          setExtraTempSelection([...extraTempSelection, url]);
                        }
                      }
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      seleccionada 
                        ? 'border-emerald-500 scale-[0.98]' 
                        : 'border-bib-dark-3 hover:border-bib-gray'
                    }`}
                  >
                    <img src={url} alt="Miniatura" className="w-full h-full object-cover" />
                    {seleccionada && (
                      <span className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {pickerMode === 'extra' && (
              <div className="p-4 border-t border-bib-dark-3 flex justify-between items-center bg-bib-dark-2/50">
                <span className="text-xs text-bib-gray">
                  {extraTempSelection.length} seleccionada(s)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPickerOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-bib-gray hover:text-bib-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmExtraSelection}
                    className="px-4 py-2 bg-bib-red hover:bg-bib-red/90 text-bib-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Confirmar Selección
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}