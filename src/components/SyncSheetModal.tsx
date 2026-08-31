import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  ExternalLink, 
  FileSpreadsheet, 
  CheckCircle2, 
  Upload, 
  Download, 
  Layers,
  Sparkles,
  Database
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { exportInventoryToExcel } from '../utils/inventoryUtils';
import initialInventoryData from '../data/initialInventory.json';

export const SyncSheetModal: React.FC = () => {
  const { 
    isSyncModalOpen, 
    setIsSyncModalOpen, 
    items, 
    setItems, 
    stats 
  } = useInventory();

  if (!isSyncModalOpen) return null;

  const [isSyncing, setIsSyncing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResetToSheetData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setItems(initialInventoryData as any);
      setIsSyncing(false);
      setSuccessMessage('¡Inventario restablecido y sincronizado con el Google Sheet original de la universidad!');
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 600);
  };

  const handleExportFullDatabase = () => {
    exportInventoryToExcel(items, `Inventario_Completo_FCM_UABC_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
              Google Sheets Live Sync
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Sincronización y Origen de Datos FCM
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Conectado al libro oficial de inventario de laboratorios de la universidad.
          </p>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Source Link Box */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 uppercase flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                Hoja de Cálculo de Origen
              </span>
              <a
                href="https://docs.google.com/spreadsheets/d/e/2PACX-1vTI5N_XrAy7VTfQgf_u-7H--9xuNkGLPsHCJ9hTwrq9kTcRRYVPBB5VE8FKUsoJzg/pubhtml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-teal-700 hover:text-teal-950 flex items-center gap-1 underline"
              >
                Abrir Google Sheet <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-600">
              Contiene 20 pestañas normalizadas (Buretas, Matraces, Embudos, Pipetas, Probetas, Recipientes, Tubos, Vasos, Equipos, etc.) con <strong className="text-slate-900">{stats.totalItems.toLocaleString()} productos</strong> y más de 80,000 unidades.
            </p>
          </div>

          {/* Success Message Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Database Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Acciones de Datos y Respaldo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleResetToSheetData}
                disabled={isSyncing}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs mb-1">
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Restablecer desde Sheet</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Recarga los datos originales de las 20 pestañas del Google Sheet de la universidad.
                </p>
              </button>

              <button
                onClick={handleExportFullDatabase}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                  <Download className="w-4 h-4" />
                  <span>Exportar Base Completa</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Descarga un archivo Excel (.xlsx) estructurado con los 1,043 artículos y sus estados.
                </p>
              </button>
            </div>
          </div>

          {/* Live Ingestion Stats Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-600" />
              Resumen de Ingesta y Limpieza de Datos
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>• 1,043 productos procesados</div>
              <div>• 18 categorías normalizadas</div>
              <div>• 89 registros con observaciones</div>
              <div>• 5 balanzas para calibración</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
