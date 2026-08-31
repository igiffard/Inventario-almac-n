import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  Eye, 
  QrCode, 
  ArrowUpDown, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  LayoutList, 
  LayoutGrid, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  MapPin, 
  Tag,
  ArrowRightLeft,
  FileSpreadsheet,
  Package
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem, ConditionStatus } from '../types';
import { exportInventoryToExcel } from '../utils/inventoryUtils';

export const InventoryTableView: React.FC = () => {
  const { 
    filteredItems, 
    items,
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    selectedCondition, 
    setSelectedCondition, 
    selectedStockStatus, 
    setSelectedStockStatus, 
    selectedCustodian, 
    setSelectedCustodian, 
    selectedLocation, 
    setSelectedLocation,
    categories, 
    custodiansList,
    viewMode, 
    setViewMode,
    setSelectedItem,
    setIsTransferModalOpen,
    setIsTagModalOpen,
    updateItemQuantity,
    updateItemCondition
  } = useInventory();

  // Sorting
  const [sortField, setSortField] = useState<keyof InventoryItem>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal || '').toLowerCase();
      const strB = String(bVal || '').toLowerCase();
      if (strA < strB) return sortAsc ? -1 : 1;
      if (strA > strB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortAsc]);

  // Paginated slice
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(start, start + itemsPerPage);
  }, [sortedItems, currentPage, itemsPerPage]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedCondition('ALL');
    setSelectedStockStatus('ALL');
    setSelectedCustodian('ALL');
    setSelectedLocation('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'ALL' || selectedCondition !== 'ALL' || selectedStockStatus !== 'ALL' || selectedCustodian !== 'ALL' || selectedLocation !== 'ALL';

  const getConditionBadge = (item: InventoryItem) => {
    switch (item.conditionStatus) {
      case 'EXCELLENT':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Excelente</span>;
      case 'FAIR':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">🔵 Regular / Usado</span>;
      case 'NEEDS_CALIBRATION':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">🟡 Calibrar</span>;
      case 'DAMAGED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">🟠 Desgastado/Dañado</span>;
      case 'BROKEN':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">🔴 Roto / Inoperable</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{item.conditionLabel}</span>;
    }
  };

  const getStockBadge = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-rose-600 text-white shadow-xs">Agotado (0)</span>;
    }
    if (item.restockNeeded) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">⚠️ Reabastecer</span>;
    }
    if (item.stockStatus === 'SURPLUS') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">Excedente</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Stock OK</span>;
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Search & Filter Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Main Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre, código FCM, marca, modelo, material, volumen o custodio..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-teal-600 rounded-xl text-sm outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* View Toggles & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'table' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vista de Tabla"
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'cards' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vista de Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
            </div>

            <button
              onClick={() => exportInventoryToExcel(sortedItems, 'Inventario_Filtrado_FCM.xlsx')}
              className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Exportar registros filtrados a Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Exportar ({sortedItems.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="ALL">Todas las Categorías ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Condition Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              ¿Reabastecer o Stock OK?
            </label>
            <select
              value={selectedStockStatus}
              onChange={(e) => {
                setSelectedStockStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="ALL">Todos los Niveles de Stock</option>
              <option value="RESTOCK_NEEDED">🚨 Reabastecer Necesario (Bajo o Dañado)</option>
              <option value="STOCK_OK">✓ Stock OK / Suficiente</option>
              <option value="LOW_STOCK">Stock Bajo</option>
              <option value="SURPLUS">Excedente</option>
            </select>
          </div>

          {/* Physical Condition Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Estado Físico / Condición
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="ALL">Cualquier Condición</option>
              <option value="EXCELLENT">🟢 Excelente / Operativo</option>
              <option value="FAIR">🔵 Regular / Lijadas / Con uso</option>
              <option value="NEEDS_CALIBRATION">🟡 Requiere Calibración</option>
              <option value="DAMAGED">🟠 Desgastado / Dañado</option>
              <option value="BROKEN">🔴 Roto / Inoperable</option>
            </select>
          </div>

          {/* Custodian Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Responsable / Custodio
            </label>
            <select
              value={selectedCustodian}
              onChange={(e) => {
                setSelectedCustodian(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="ALL">Todos los Responsables</option>
              {custodiansList.map(cust => (
                <option key={cust} value={cust}>{cust}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Mostrando <strong className="text-slate-800">{sortedItems.length}</strong> de <strong className="text-slate-800">{items.length}</strong> productos
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer Filtros
            </button>
          )}
        </div>
      </div>

      {/* View: Table Mode */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold select-none">
                  <th 
                    onClick={() => handleSort('inventoryCode')}
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Código FCM</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Producto & Especificaciones</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('category')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors hidden md:table-cell"
                  >
                    <div className="flex items-center gap-1">
                      <span>Categoría / Material</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('quantity')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Existencias</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('custodian')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors hidden lg:table-cell"
                  >
                    <div className="flex items-center gap-1">
                      <span>¿Quién lo tiene?</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('conditionStatus')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Condición</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('restockNeeded')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>¿Reabastecer?</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3.5 text-right font-medium text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Package className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="font-semibold text-slate-700">No se encontraron productos con estos filtros</p>
                        <p className="text-xs text-slate-400">Intenta buscar con otros términos o limpia los filtros.</p>
                        <button
                          onClick={resetFilters}
                          className="mt-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold"
                        >
                          Limpiar todos los filtros
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr 
                      key={item.id}
                      className="hover:bg-teal-50/40 transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsTagModalOpen(true);
                          }}
                          className="font-mono text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50/80 px-2 py-0.5 rounded border border-teal-200/80 inline-flex items-center gap-1"
                          title="Ver etiqueta con código de barras"
                        >
                          <Tag className="w-3 h-3 text-teal-600" />
                          <span>{item.inventoryCode}</span>
                        </button>
                      </td>

                      {/* Name & Specs */}
                      <td className="py-3 px-3.5">
                        <div 
                          onClick={() => setSelectedItem(item)}
                          className="cursor-pointer"
                        >
                          <div className="font-bold text-slate-900 group-hover:text-teal-900 leading-snug">
                            {item.name} {item.volume ? <span className="font-semibold text-teal-700">({item.volume})</span> : ''}
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                            {item.brand && (
                              <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                                {item.brand} {item.model || ''}
                              </span>
                            )}
                            {item.specifications && (
                              <span className="truncate max-w-xs">{item.specifications}</span>
                            )}
                            {item.classification && (
                              <span className="text-[10px] px-1 bg-amber-50 text-amber-800 rounded border border-amber-200">
                                Clase {item.classification}
                              </span>
                            )}
                          </div>
                          {item.observations && (
                            <div className="text-[11px] text-amber-800 font-medium mt-0.5 truncate max-w-sm flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                              <span>Obs: {item.observations}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category & Material */}
                      <td className="py-3 px-3 hidden md:table-cell">
                        <span className="text-xs font-semibold text-slate-700 block truncate">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block">
                          {item.material || 'Material estándar'}
                        </span>
                      </td>

                      {/* Quantity with quick buttons */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => updateItemQuantity(item.id, -1)}
                            className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition-colors"
                            title="Disminuir unidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className={`font-mono text-sm font-extrabold min-w-[2.5rem] text-center ${
                            item.quantity === 0 ? 'text-rose-600' : 'text-slate-900'
                          }`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItemQuantity(item.id, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 hover:bg-teal-100 text-slate-600 hover:text-teal-700 transition-colors"
                            title="Aumentar unidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block text-center mt-0.5">
                          {item.unit}
                        </span>
                      </td>

                      {/* Custodian & Location */}
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <div className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                          {item.custodian}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      </td>

                      {/* Condition Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getConditionBadge(item)}
                      </td>

                      {/* Stock Health */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        {getStockBadge(item)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Transfer Custody */}
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setIsTransferModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Asignar / Prestar a Investigador o Lab"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          {/* View Tag */}
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setIsTagModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Imprimir Etiqueta / Código de Barras"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Detail Modal */}
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Ver Ficha Técnica Completa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>Elementos por página:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded-md py-1 px-2 text-xs font-semibold outline-none"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>Página {currentPage} de {totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View: Cards Mode */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {item.inventoryCode}
                  </span>
                  {getStockBadge(item)}
                </div>

                <h3 
                  onClick={() => setSelectedItem(item)}
                  className="text-base font-bold text-slate-900 hover:text-teal-900 cursor-pointer line-clamp-2"
                >
                  {item.name} {item.volume ? `(${item.volume})` : ''}
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {item.specifications || item.material || item.category}
                </p>

                <div className="my-3 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Responsable:</span>
                    <strong className="text-slate-900 truncate max-w-[150px]">{item.custodian}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Ubicación:</span>
                    <span className="text-slate-700 truncate max-w-[150px]">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Condición:</span>
                    {getConditionBadge(item)}
                  </div>
                </div>

                {item.observations && (
                  <div className="text-xs p-2 rounded-lg bg-amber-50 text-amber-900 font-medium mb-3 border border-amber-200">
                    ⚠️ {item.observations}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateItemQuantity(item.id, -1)}
                    className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-extrabold text-sm text-slate-900 min-w-[2rem] text-center font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateItemQuantity(item.id, 1)}
                    className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 hover:bg-teal-100 text-slate-600 hover:text-teal-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsTransferModalOpen(true);
                    }}
                    className="p-2 text-indigo-700 hover:bg-indigo-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                    title="Prestar o Transferir Custodia"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold transition-colors"
                  >
                    Ficha Técnica
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
