import React, { useState } from 'react';
import { X, Plus, Package, Building2, MapPin, Users, Stethoscope } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem } from '../types';

export const AddItemModal: React.FC = () => {
  const { 
    isAddModalOpen, 
    setIsAddModalOpen, 
    addNewItem, 
    categories, 
    custodiansList, 
    locations 
  } = useInventory();

  if (!isAddModalOpen) return null;

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: categories[0] || 'MATERIAL DE USO MÚLTIPLE',
    type: '',
    volume: '',
    material: 'VIDRIO',
    classification: 'A',
    brand: '',
    model: '',
    specifications: '',
    quantity: 1,
    unit: 'unidades',
    location: 'Almacén Central FCM',
    custodian: 'Almacén Central FCM',
    observations: '',
    minThreshold: 2
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    addNewItem(formData);
    setIsAddModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
              Alta de Producto
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Registrar Nuevo Producto en Inventario
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Agrega reactivos, vidriería, equipos o insumos al catálogo universitario FCM.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nombre del Producto / Equipo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Matraz Erlenmeyer, Balanza Digital, etc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-600"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tipo / Subtipo
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                placeholder="Ej. Buchner, Graduado, Conico"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Volume, Material & Classification */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Volumen / Capacidad
              </label>
              <input
                type="text"
                value={formData.volume}
                onChange={e => setFormData({ ...formData, volume: e.target.value })}
                placeholder="Ej. 250 mL, 10 kg"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Material
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={e => setFormData({ ...formData, material: e.target.value })}
                placeholder="VIDRIO, PLÁSTICO, METAL"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Clase
              </label>
              <input
                type="text"
                value={formData.classification}
                onChange={e => setFormData({ ...formData, classification: e.target.value })}
                placeholder="A, B, etc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Brand & Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Marca (si aplica)
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ej. OHAUS, FLUKE, PYREX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Modelo / No. Serie
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                placeholder="Ej. SMP20, 115"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Quantity, Unit & Min Threshold */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-teal-50/50 border border-teal-100 rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-teal-900 uppercase mb-1">
                Cantidad Inicial *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-900 uppercase mb-1">
                Unidad
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                placeholder="unidades, paquetes, rollos"
                className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-medium outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-900 uppercase mb-1">
                Umbral Mínimo
              </label>
              <input
                type="number"
                min="1"
                value={formData.minThreshold}
                onChange={e => setFormData({ ...formData, minThreshold: parseInt(e.target.value) || 2 })}
                className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-bold outline-none"
              />
            </div>
          </div>

          {/* Location & Custodian */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Ubicación / Estante *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ej. 9A1, Lab Microbiología, 13C2"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Responsable / Custodio *
              </label>
              <select
                value={formData.custodian}
                onChange={e => setFormData({ ...formData, custodian: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-600"
              >
                {custodiansList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Observaciones / Condición Especial
            </label>
            <input
              type="text"
              value={formData.observations}
              onChange={e => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Ej. Nuevo en caja, 2 lijadas, calibrado reciente..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-600"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Guardar en Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
