import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Package, 
  ArrowRightLeft, 
  Clock, 
  ShieldCheck, 
  Building, 
  FileText, 
  CheckCircle, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem } from '../types';

export const CustodyView: React.FC = () => {
  const { 
    items, 
    custodyLogs, 
    setSelectedItem, 
    setIsTransferModalOpen, 
    setSelectedCustodian,
    setActiveTab
  } = useInventory();

  const [searchCust, setSearchCust] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  // Group items by custodian
  const custodianGroups = useMemo(() => {
    const map = new Map<string, {
      name: string;
      department: string;
      location: string;
      items: InventoryItem[];
      totalUnits: number;
    }>();

    items.forEach(item => {
      const cust = item.custodian || 'Almacén Central FCM';
      const existing = map.get(cust) || {
        name: cust,
        department: item.custodianDepartment || 'Facultad de Ciencias Marinas',
        location: item.location || 'Almacén Central FCM',
        items: [],
        totalUnits: 0
      };

      existing.items.push(item);
      existing.totalUnits += typeof item.quantity === 'number' ? item.quantity : 1;
      map.set(cust, existing);
    });

    return Array.from(map.values()).sort((a, b) => {
      // Keep Central warehouse first, then sort by items count
      if (a.name.includes('Almacén')) return -1;
      if (b.name.includes('Almacén')) return 1;
      return b.items.length - a.items.length;
    });
  }, [items]);

  const filteredCustodians = useMemo(() => {
    if (!searchCust.trim()) return custodianGroups;
    const q = searchCust.toLowerCase();
    return custodianGroups.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.department.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  }, [custodianGroups, searchCust]);

  const activeGroup = useMemo(() => {
    if (selectedPerson) {
      return custodianGroups.find(c => c.name === selectedPerson) || custodianGroups[0];
    }
    return custodianGroups[0];
  }, [custodianGroups, selectedPerson]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            Directorio de Resguardos y Custodios
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Control de Responsables, Laboratorios y Asignaciones
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Monitorea con precisión qué investigador, técnico o laboratorio tiene bajo su custodia cada lote de reactivos, cristalería o equipo universitario.
          </p>
        </div>

        <button
          onClick={() => {
            setIsTransferModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all shrink-0"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Registrar Préstamo / Transferencia</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Custodians List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCust}
              onChange={(e) => setSearchCust(e.target.value)}
              placeholder="Buscar responsable o laboratorio..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredCustodians.map((cust) => {
              const isSelected = activeGroup?.name === cust.name;
              return (
                <div
                  key={cust.name}
                  onClick={() => setSelectedPerson(cust.name)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-indigo-50/80 border-l-4 border-indigo-600 pl-3' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {cust.name}
                    </h4>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                      {cust.items.length} art.
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-1">
                    {cust.department}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.location}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Custodian Dossier (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeGroup && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                    {activeGroup.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {activeGroup.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {activeGroup.department} • <span className="text-indigo-700 font-semibold">{activeGroup.location}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCustodian(activeGroup.name);
                      setActiveTab('inventory');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Ver en Catálogo
                  </button>
                  <button
                    onClick={() => {
                      setIsTransferModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Asignar Producto
                  </button>
                </div>
              </div>

              {/* Summary Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Productos Asignados</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {activeGroup.items.length}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Unidades Totales</span>
                  <div className="text-xl font-extrabold text-indigo-700 mt-0.5">
                    {activeGroup.totalUnits.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Estado Resguardo</span>
                  <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>En Regla</span>
                  </div>
                </div>
              </div>

              {/* Items List Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Detalle de Artículos en Posesión ({activeGroup.items.length})
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Código</th>
                          <th className="py-2.5 px-3">Producto / Tipo</th>
                          <th className="py-2.5 px-3 text-center">Cantidad</th>
                          <th className="py-2.5 px-3">Condición</th>
                          <th className="py-2.5 px-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeGroup.items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-teal-800">
                              {item.inventoryCode}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{item.name} {item.volume ? `(${item.volume})` : ''}</div>
                              <div className="text-[11px] text-slate-500">{item.specifications || item.material}</div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {item.conditionLabel}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="text-teal-700 hover:text-teal-900 font-bold"
                              >
                                Ver Ficha
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custody Loan Logs History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Historial de Préstamos y Movimientos Recientes
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {custodyLogs.length} movimientos registrados
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Equipo / Material</th>
                <th className="py-2.5 px-3">De</th>
                <th className="py-2.5 px-3">Hacia (Custodio)</th>
                <th className="py-2.5 px-3">Motivo / Práctica</th>
                <th className="py-2.5 px-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {custodyLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-medium text-slate-600">{log.transferDate}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{log.inventoryCode}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{log.itemName}</td>
                  <td className="py-2.5 px-3 text-slate-600">{log.fromCustodian}</td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-900">{log.toCustodian}</td>
                  <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{log.reason}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {log.status === 'ACTIVE' ? 'Activo en Lab' : 'Devuelto'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
