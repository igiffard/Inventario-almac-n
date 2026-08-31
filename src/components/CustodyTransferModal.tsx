import React, { useState } from 'react';
import { X, ArrowRightLeft, Users, MapPin, Building, Sparkles } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const CustodyTransferModal: React.FC = () => {
  const { 
    isTransferModalOpen, 
    setIsTransferModalOpen, 
    items, 
    selectedItem, 
    custodiansList, 
    transferCustody 
  } = useInventory();

  if (!isTransferModalOpen) return null;

  const [selectedItemId, setSelectedItemId] = useState<string>(selectedItem?.id || items[0]?.id || '');
  const [newCustodian, setNewCustodian] = useState<string>(custodiansList[0] || 'Almacén Central FCM');
  const [customCustodian, setCustomCustodian] = useState('');
  const [newLocation, setNewLocation] = useState<string>('Laboratorio de Docencia FCM');
  const [reason, setReason] = useState<string>('Práctica académica / Proyecto de investigación');

  const currentTargetItem = items.find(i => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;

    const finalCustodian = customCustodian.trim() ? customCustodian.trim() : newCustodian;
    transferCustody(selectedItemId, finalCustodian, newLocation, reason);
    setIsTransferModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-indigo-900 text-white p-6 relative">
          <button
            onClick={() => setIsTransferModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 uppercase">
              Movimiento de Custodia
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Asignar o Prestar Equipo a Investigador / Lab
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            Registra el traspaso formal de custodia y ubicación de un producto universitario.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Item Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Producto / Equipo a Transferir *
            </label>
            <select
              value={selectedItemId}
              onChange={e => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-600"
            >
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.inventoryCode} • {item.name} {item.volume ? `(${item.volume})` : ''} - [Actual: {item.custodian}]
                </option>
              ))}
            </select>
          </div>

          {/* Current Status Box */}
          {currentTargetItem && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
              <div className="text-slate-500">
                Custodio Actual: <strong className="text-slate-900">{currentTargetItem.custodian}</strong>
              </div>
              <div className="text-slate-500">
                Ubicación Actual: <strong className="text-slate-900">{currentTargetItem.location}</strong>
              </div>
              <div className="text-slate-500">
                Existencias: <strong className="text-slate-900">{currentTargetItem.quantity} {currentTargetItem.unit}</strong>
              </div>
            </div>
          )}

          {/* New Custodian */}
          <div>
            <label className="block text-xs font-bold text-indigo-950 uppercase mb-1">
              Nuevo Responsable / Custodio *
            </label>
            <select
              value={newCustodian}
              onChange={e => setNewCustodian(e.target.value)}
              className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 outline-none focus:border-indigo-600 mb-2"
            >
              {custodiansList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="text"
              value={customCustodian}
              onChange={e => setCustomCustodian(e.target.value)}
              placeholder="O escribe otro nombre (ej. Alumno / Profesor externo)..."
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
            />
          </div>

          {/* New Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nueva Ubicación / Laboratorio *
            </label>
            <input
              type="text"
              required
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              placeholder="Ej. Lab Bioquímica, Cubículo 6, Lab Zoología E15"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-600"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Motivo del Préstamo / Práctica Académica *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ej. Prácticas de Química Orgánica 2026, Campaña de Muestreo..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-600"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Confirmar Asignación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
