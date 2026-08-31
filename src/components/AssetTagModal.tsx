import React from 'react';
import { X, Printer, QrCode, Tag, Sparkles, Building2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const AssetTagModal: React.FC = () => {
  const { 
    isTagModalOpen, 
    setIsTagModalOpen, 
    selectedItem 
  } = useInventory();

  if (!isTagModalOpen || !selectedItem) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Etiqueta de Activo Universitario</h3>
          </div>
          <button
            onClick={() => setIsTagModalOpen(false)}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Tag Container */}
        <div className="p-6">
          <div className="p-5 border-2 border-dashed border-slate-800 rounded-2xl bg-white space-y-3 font-sans shadow-xs print:border-solid print:m-0 print:p-4">
            {/* Tag Header */}
            <div className="border-b border-slate-300 pb-2 text-center">
              <div className="text-[10px] font-black tracking-widest text-slate-800 uppercase">
                Universidad Autónoma de Baja California
              </div>
              <div className="text-[9px] font-bold text-teal-800 uppercase">
                Facultad de Ciencias Marinas • Inventario FCM
              </div>
            </div>

            {/* Barcode Graphic */}
            <div className="text-center py-1">
              <div className="inline-flex flex-col items-center">
                {/* Simulated high density barcode */}
                <div className="h-10 w-48 flex items-stretch justify-between gap-[2px] bg-white px-2">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 3].map((w, idx) => (
                    <div
                      key={idx}
                      className={`bg-black ${idx % 2 === 0 ? 'opacity-100' : 'opacity-0'}`}
                      style={{ width: `${w * 2}px` }}
                    ></div>
                  ))}
                </div>
                <div className="font-mono text-xs font-black tracking-widest text-slate-900 mt-1">
                  *{selectedItem.inventoryCode}*
                </div>
              </div>
            </div>

            {/* Item Details on Sticker */}
            <div className="text-xs space-y-1 pt-1 border-t border-slate-200">
              <div className="font-black text-slate-900 leading-tight">
                {selectedItem.name} {selectedItem.volume ? `(${selectedItem.volume})` : ''}
              </div>
              <div className="text-[10px] text-slate-600">
                {selectedItem.brand ? `Marca: ${selectedItem.brand} ${selectedItem.model || ''}` : `Cat: ${selectedItem.category}`}
              </div>
              <div className="text-[10px] text-slate-600">
                Ubicación: <strong className="text-slate-900">{selectedItem.location}</strong>
              </div>
              <div className="text-[10px] text-slate-600">
                Custodio: <strong className="text-slate-900">{selectedItem.custodian}</strong>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
              <span>Condición: {selectedItem.conditionLabel}</span>
              <span>Reg: {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 no-print">
          <button
            onClick={() => setIsTagModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Etiqueta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
