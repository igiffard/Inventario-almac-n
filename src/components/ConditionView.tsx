import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  Scale, 
  Flame, 
  Wrench, 
  Search, 
  Plus, 
  Check, 
  History, 
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem, ConditionStatus } from '../types';

export const ConditionView: React.FC = () => {
  const { 
    items, 
    updateItemCondition, 
    maintenanceLogs, 
    addMaintenanceLog,
    setSelectedItem 
  } = useInventory();

  const [activeConditionTab, setActiveConditionTab] = useState<'ALL_ATTENTION' | 'CALIBRATION' | 'DAMAGED' | 'BROKEN' | 'EXCELLENT'>('ALL_ATTENTION');
  const [searchCondition, setSearchCondition] = useState('');

  // Items grouped by condition
  const conditionStats = useMemo(() => {
    let excellent = 0;
    let fair = 0;
    let calibration = 0;
    let damaged = 0;
    let broken = 0;

    items.forEach(i => {
      if (i.conditionStatus === 'EXCELLENT') excellent++;
      else if (i.conditionStatus === 'FAIR') fair++;
      else if (i.conditionStatus === 'NEEDS_CALIBRATION') calibration++;
      else if (i.conditionStatus === 'DAMAGED') damaged++;
      else if (i.conditionStatus === 'BROKEN') broken++;
    });

    return { excellent, fair, calibration, damaged, broken, total: items.length };
  }, [items]);

  // Filtered items
  const filteredConditionItems = useMemo(() => {
    let result = items;

    if (activeConditionTab === 'ALL_ATTENTION') {
      result = items.filter(i => i.conditionStatus !== 'EXCELLENT');
    } else if (activeConditionTab === 'CALIBRATION') {
      result = items.filter(i => i.conditionStatus === 'NEEDS_CALIBRATION');
    } else if (activeConditionTab === 'DAMAGED') {
      result = items.filter(i => i.conditionStatus === 'DAMAGED');
    } else if (activeConditionTab === 'BROKEN') {
      result = items.filter(i => i.conditionStatus === 'BROKEN');
    } else if (activeConditionTab === 'EXCELLENT') {
      result = items.filter(i => i.conditionStatus === 'EXCELLENT');
    }

    if (searchCondition.trim()) {
      const q = searchCondition.toLowerCase();
      result = result.filter(i => 
        i.name.toLowerCase().includes(q) ||
        i.inventoryCode.toLowerCase().includes(q) ||
        (i.observations || '').toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.custodian.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, activeConditionTab, searchCondition]);

  const handleMarkCalibrated = (item: InventoryItem) => {
    updateItemCondition(item.id, 'EXCELLENT', 'Calibrado y verificado - En óptimas condiciones operativas');
    addMaintenanceLog({
      itemId: item.id,
      itemName: item.name,
      date: new Date().toISOString().split('T')[0],
      type: 'CALIBRATION',
      performedBy: 'Técnico de Metrología FCM',
      notes: 'Calibración con pesas patrón y ajuste de cero completado con éxito.'
    });
  };

  const handleMarkRepaired = (item: InventoryItem) => {
    updateItemCondition(item.id, 'EXCELLENT', 'Reparado / Limpiado / En buen estado');
    addMaintenanceLog({
      itemId: item.id,
      itemName: item.name,
      date: new Date().toISOString().split('T')[0],
      type: 'REPAIR',
      performedBy: 'Encargado de Laboratorio',
      notes: 'Mantenimiento preventivo/correctivo aplicado satisfactoriamente.'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Stethoscope className="w-3.5 h-3.5" />
          Control de Calidad, Estado Físico y Metrología
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Auditoría de Condición Física de Equipos y Cristalería
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Monitorea el desgaste de materiales de vidrio, cápsulas quemadas, agujas oxidadas y balanzas analíticas que requieren calibración periódica.
        </p>

        {/* Condition Filter Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5">
          <button
            onClick={() => setActiveConditionTab('ALL_ATTENTION')}
            className={`p-3 rounded-xl text-left border transition-all ${
              activeConditionTab === 'ALL_ATTENTION'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block opacity-80">Requieren Atención</span>
            <div className="text-xl font-extrabold mt-0.5">
              {conditionStats.total - conditionStats.excellent}
            </div>
          </button>

          <button
            onClick={() => setActiveConditionTab('CALIBRATION')}
            className={`p-3 rounded-xl text-left border transition-all ${
              activeConditionTab === 'CALIBRATION'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block opacity-80">⚖️ Calibración</span>
            <div className="text-xl font-extrabold mt-0.5">
              {conditionStats.calibration}
            </div>
          </button>

          <button
            onClick={() => setActiveConditionTab('DAMAGED')}
            className={`p-3 rounded-xl text-left border transition-all ${
              activeConditionTab === 'DAMAGED'
                ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                : 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block opacity-80">🟠 Desgastado / Dañado</span>
            <div className="text-xl font-extrabold mt-0.5">
              {conditionStats.damaged}
            </div>
          </button>

          <button
            onClick={() => setActiveConditionTab('BROKEN')}
            className={`p-3 rounded-xl text-left border transition-all ${
              activeConditionTab === 'BROKEN'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block opacity-80">🔴 Roto / Inoperable</span>
            <div className="text-xl font-extrabold mt-0.5">
              {conditionStats.broken}
            </div>
          </button>

          <button
            onClick={() => setActiveConditionTab('EXCELLENT')}
            className={`p-3 rounded-xl text-left border transition-all ${
              activeConditionTab === 'EXCELLENT'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block opacity-80">🟢 Excelente / OK</span>
            <div className="text-xl font-extrabold mt-0.5">
              {conditionStats.excellent}
            </div>
          </button>
        </div>
      </div>

      {/* Items Table with Action Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCondition}
              onChange={(e) => setSearchCondition(e.target.value)}
              placeholder="Buscar por equipo o detalle de daño..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500"
            />
          </div>

          <div className="text-xs text-slate-500">
            Mostrando <strong>{filteredConditionItems.length}</strong> artículos
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Producto / Equipo</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Condición Actual</th>
                <th className="py-2.5 px-3">Observaciones Registradas</th>
                <th className="py-2.5 px-3">Custodio</th>
                <th className="py-2.5 px-3 text-right">Acciones de Mantenimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredConditionItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron artículos en este criterio.
                  </td>
                </tr>
              ) : (
                filteredConditionItems.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-teal-800">
                      {item.inventoryCode}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.name} {item.volume ? `(${item.volume})` : ''}</div>
                      <div className="text-[11px] text-slate-500">{item.brand ? `${item.brand} ${item.model || ''}` : item.specifications}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{item.category}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.conditionStatus === 'NEEDS_CALIBRATION' ? 'bg-amber-100 text-amber-800' :
                        item.conditionStatus === 'BROKEN' ? 'bg-rose-100 text-rose-800' :
                        item.conditionStatus === 'DAMAGED' ? 'bg-orange-100 text-orange-800' :
                        item.conditionStatus === 'FAIR' ? 'bg-blue-100 text-blue-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.conditionLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-amber-900">
                      {item.observations ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                          <span>{item.observations}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Sin notas de defecto</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{item.custodian}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.conditionStatus === 'NEEDS_CALIBRATION' && (
                          <button
                            onClick={() => handleMarkCalibrated(item)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1"
                          >
                            <Scale className="w-3 h-3" />
                            <span>Calibrado</span>
                          </button>
                        )}

                        {(item.conditionStatus === 'DAMAGED' || item.conditionStatus === 'FAIR') && (
                          <button
                            onClick={() => handleMarkRepaired(item)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Corregido</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Ficha
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance & Calibration Logs History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <History className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Bitácora de Mantenimientos y Calibraciones Realizadas
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {maintenanceLogs.length} registros en bitácora
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Equipo / Material</th>
                <th className="py-2.5 px-3">Tipo de Servicio</th>
                <th className="py-2.5 px-3">Realizado Por</th>
                <th className="py-2.5 px-3">Detalle Técnico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {maintenanceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-medium text-slate-600">{log.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{log.itemName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {log.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{log.performedBy}</td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-sm truncate">{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
