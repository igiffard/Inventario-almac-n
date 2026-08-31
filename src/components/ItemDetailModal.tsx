import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  MapPin, 
  Users, 
  Stethoscope, 
  ShoppingCart, 
  Scale, 
  Plus, 
  Minus, 
  QrCode, 
  ArrowRightLeft, 
  Trash2, 
  Check,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ConditionStatus, InventoryItem } from '../types';

export const ItemDetailModal: React.FC = () => {
  const { 
    selectedItem, 
    setSelectedItem, 
    updateItemQuantity, 
    updateItemCondition, 
    setIsTransferModalOpen, 
    setIsTagModalOpen,
    deleteItem,
    updateItem 
  } = useInventory();

  if (!selectedItem) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<InventoryItem>(selectedItem);
  const [newObservation, setNewObservation] = useState(selectedItem.observations || '');

  const handleSaveEdit = () => {
    updateItem({
      ...editedItem,
      observations: newObservation
    });
    setIsEditing(false);
  };

  const handleConditionChange = (status: ConditionStatus) => {
    updateItemCondition(selectedItem.id, status, newObservation);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {selectedItem.inventoryCode}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
              {selectedItem.category}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {selectedItem.name} {selectedItem.volume ? `(${selectedItem.volume})` : ''}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {selectedItem.brand ? `${selectedItem.brand} ${selectedItem.model || ''}` : selectedItem.material || 'Material de Laboratorio FCM'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Material / Tipo</span>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5 truncate">
                {selectedItem.material || selectedItem.type || 'N/A'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Clasificación</span>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {selectedItem.classification ? `Clase ${selectedItem.classification}` : 'Estándar'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Volumen / Medidas</span>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5 truncate">
                {selectedItem.volume || selectedItem.specifications || 'N/A'}
              </div>
            </div>
          </div>

          {/* Stock Counter & Health */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Control de Existencias</span>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                  <button
                    onClick={() => updateItemQuantity(selectedItem.id, -1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-lg font-black text-slate-900 px-3">
                    {selectedItem.quantity}
                  </span>
                  <button
                    onClick={() => updateItemQuantity(selectedItem.id, 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-600">{selectedItem.unit}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 uppercase block">Diagnóstico de Stock</span>
              {selectedItem.restockNeeded ? (
                <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs mt-1">
                  ⚠️ Requiere Reabastecer ({selectedItem.restockUrgency})
                </span>
              ) : (
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs mt-1">
                  ✓ Stock Suficiente (Óptimo)
                </span>
              )}
            </div>
          </div>

          {/* Location & Custody Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 uppercase flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-700" />
                  ¿Quién lo tiene? (Custodio)
                </span>
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-950 underline"
                >
                  Transferir
                </button>
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {selectedItem.custodian}
              </p>
              <p className="text-xs text-slate-600">
                {selectedItem.custodianDepartment || 'Facultad de Ciencias Marinas'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-2">
              <span className="text-xs font-bold text-teal-900 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-700" />
                Ubicación Física
              </span>
              <p className="text-sm font-extrabold text-slate-900">
                {selectedItem.location}
              </p>
              <p className="text-xs text-slate-600">
                {selectedItem.locationDetails || 'Almacén Central FCM'}
              </p>
            </div>
          </div>

          {/* Condition & Observations Updater */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-amber-700" />
                Estado Físico y Condición
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                {selectedItem.conditionLabel}
              </span>
            </div>

            {/* Quick Status Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleConditionChange('EXCELLENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedItem.conditionStatus === 'EXCELLENT' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                🟢 Excelente
              </button>
              <button
                onClick={() => handleConditionChange('FAIR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedItem.conditionStatus === 'FAIR' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                🔵 Regular / Usado
              </button>
              <button
                onClick={() => handleConditionChange('NEEDS_CALIBRATION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedItem.conditionStatus === 'NEEDS_CALIBRATION' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                🟡 Calibrar
              </button>
              <button
                onClick={() => handleConditionChange('DAMAGED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedItem.conditionStatus === 'DAMAGED' ? 'bg-orange-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                🟠 Desgastado / Dañado
              </button>
              <button
                onClick={() => handleConditionChange('BROKEN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedItem.conditionStatus === 'BROKEN' ? 'bg-rose-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                🔴 Roto
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">
                Notas y Observaciones de Auditoría:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObservation}
                  onChange={(e) => setNewObservation(e.target.value)}
                  placeholder="Ej. 2 lijadas, astillado leve, calibrado 2026..."
                  className="flex-1 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => updateItemCondition(selectedItem.id, selectedItem.conditionStatus, newObservation)}
                  className="px-3 py-1.5 bg-amber-800 text-white rounded-lg text-xs font-bold hover:bg-amber-900"
                >
                  Guardar Nota
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`¿Estás seguro de eliminar "${selectedItem.name}" del catálogo?`)) {
                deleteItem(selectedItem.id);
              }
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar Artículo
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsTagModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Ver Etiqueta FCM</span>
            </button>

            <button
              onClick={() => setSelectedItem(null)}
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
