import React from 'react';
import { 
  Building2, 
  RefreshCw, 
  Plus, 
  FileSpreadsheet, 
  ExternalLink, 
  PackageCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { exportInventoryToExcel } from '../utils/inventoryUtils';
import { DEFAULT_SHEET_URL } from '../data/initialInventory';

export const Header: React.FC = () => {
  const { 
    items, 
    stats, 
    setIsAddModalOpen, 
    setIsSyncModalOpen, 
    resetToDefault, 
    applyPreset 
  } = useInventory();

  const handleExport = () => {
    exportInventoryToExcel(items, `Inventario_FCM_UABC_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & University Context */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-teal-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  FCM • UABC
                </span>
                <span className="text-xs text-slate-500 hidden md:inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Inventario en Línea 2026
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Sistema de Control de Almacén e Inventario
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Facultad de Ciencias Marinas • Materiales, Vidriería, Equipos y Custodias
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Status Chips */}
            <button
              onClick={() => applyPreset('restock')}
              className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                stats.needsRestockCount > 0 
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
              title="Ver productos con necesidad de reabastecimiento"
            >
              {stats.needsRestockCount > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>{stats.needsRestockCount} Reabastecer</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Stock Completo</span>
                </>
              )}
            </button>

            {/* Sync with Google Sheet */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
              title="Sincronizar o importar datos de Google Sheets"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">Sincronizar Hoja</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              title="Descargar Excel completo con códigos y custodios"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>

            {/* Add New Item */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition-all focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Registrar Producto</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
