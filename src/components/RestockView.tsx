import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  Printer, 
  DollarSign, 
  ArrowRight, 
  Search, 
  Check, 
  Clock, 
  Building2, 
  Sparkles,
  PackageCheck,
  TrendingDown,
  Filter
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { RestockOrderPlan } from '../types';
import { exportRestockPlanToExcel } from '../utils/inventoryUtils';
import confetti from 'canvas-confetti';

export const RestockView: React.FC = () => {
  const { 
    restockOrders, 
    updateRestockOrderStatus, 
    stats,
    items,
    setSelectedItem 
  } = useInventory();

  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'LOW_STOCK'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    return restockOrders.filter(o => {
      if (urgencyFilter !== 'ALL' && o.urgency !== urgencyFilter) return false;
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!o.name.toLowerCase().includes(q) && !o.category.toLowerCase().includes(q) && !o.reason.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [restockOrders, urgencyFilter, statusFilter, searchQuery]);

  // Financial Estimates
  const financials = useMemo(() => {
    const totalItems = restockOrders.length;
    const totalUnitsToOrder = restockOrders.reduce((sum, o) => sum + o.recommendedOrder, 0);
    const totalEstimatedCost = restockOrders.reduce((sum, o) => sum + (o.recommendedOrder * (o.estimatedUnitPrice || 0)), 0);
    const criticalCount = restockOrders.filter(o => o.urgency === 'CRITICAL' || o.currentStock === 0).length;

    return {
      totalItems,
      totalUnitsToOrder,
      totalEstimatedCost,
      criticalCount
    };
  }, [restockOrders]);

  const handleExportExcel = () => {
    exportRestockPlanToExcel(filteredOrders, `Requisicion_Compras_FCM_${new Date().toISOString().split('T')[0]}.xlsx`);
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {}
  };

  const handlePrint = () => {
    window.print();
  };

  const handleApproveAll = () => {
    filteredOrders.forEach(o => {
      if (o.status === 'PENDING') {
        updateRestockOrderStatus(o.id, 'APPROVED');
      }
    });
    try {
      confetti({ particleCount: 50, spread: 70 });
    } catch (e) {}
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Printable University Header (Visible only when printing) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold uppercase">Universidad Autónoma de Baja California</h1>
            <h2 className="text-sm font-semibold">Facultad de Ciencias Marinas • Coordinación de Laboratorios</h2>
            <p className="text-xs">Requisición Oficial de Compras y Reabastecimiento de Almacén</p>
          </div>
          <div className="text-right text-xs">
            <p>Fecha: {new Date().toLocaleDateString('es-MX')}</p>
            <p>Folio: REQ-FCM-{new Date().getFullYear()}-001</p>
          </div>
        </div>
      </div>

      {/* Main Restock Intelligence Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
              <ShoppingCart className="w-3.5 h-3.5" />
              Módulo de Inteligencia de Abastecimiento
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Diagnóstico: ¿Necesitamos comprar más o estamos OK?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              De los <strong className="text-slate-900">{stats.totalItems} productos</strong> catalogados en la universidad, <strong className="text-emerald-700 font-bold">{stats.okStockCount} artículos cuentan con existencias óptimas</strong>.
              Se detectaron <strong className="text-rose-600 font-bold">{restockOrders.length} artículos</strong> con existencias bajas, agotadas o dañadas que requieren reabastecimiento para el próximo ciclo académico.
            </p>
          </div>

          {/* KPI Snapshot Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-center">
              <span className="text-[11px] font-bold text-rose-700 uppercase">Agotados / Críticos</span>
              <div className="text-2xl font-black text-rose-700 mt-0.5">
                {financials.criticalCount}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Unidades a Pedir</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {financials.totalUnitsToOrder.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">Presupuesto Est.</span>
              <div className="text-xl font-black text-emerald-800 mt-0.5">
                ${(financials.totalEstimatedCost / 1000).toFixed(1)}k <span className="text-[11px] font-normal">MXN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100 no-print">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Requisición a Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Formato Oficial</span>
            </button>

            <button
              onClick={handleApproveAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Aprobar Todos los Pendientes</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Generado automáticamente con base en umbrales mínimos de laboratorio
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por producto o motivo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as any)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">Todas las Urgencias</option>
            <option value="CRITICAL">🚨 Crítica / Agotado</option>
            <option value="HIGH">⚠️ Alta Urgencia</option>
            <option value="LOW_STOCK">Stock Bajo Regular</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PENDING">Pendiente de Aprobación</option>
            <option value="APPROVED">Aprobada</option>
            <option value="ORDERED">Orden de Compra Emitida</option>
            <option value="RECEIVED">Recibido en Almacén</option>
          </select>
        </div>
      </div>

      {/* Restock Requisition Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-3.5">Producto & Material</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-center">Stock Actual</th>
                <th className="py-3 px-3 text-center font-bold text-rose-700">Cant. a Pedir</th>
                <th className="py-3 px-3">Urgencia</th>
                <th className="py-3 px-3">Justificación / Motivo</th>
                <th className="py-3 px-3 text-right">Precio Est.</th>
                <th className="py-3 px-3 text-center">Estado Requisición</th>
                <th className="py-3 px-3.5 text-right no-print">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <PackageCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    <p className="font-bold text-slate-700">¡No hay artículos pendientes de compra con estos filtros!</p>
                    <p className="text-xs text-slate-400">Todos los productos seleccionados cuentan con stock suficiente.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const targetItem = items.find(i => i.id === order.itemId);
                  return (
                    <tr key={order.id} className="hover:bg-rose-50/20 transition-colors">
                      {/* Product Name */}
                      <td className="py-3 px-3.5">
                        <div 
                          onClick={() => targetItem && setSelectedItem(targetItem)}
                          className="cursor-pointer"
                        >
                          <div className="font-bold text-slate-900 hover:text-teal-900 leading-snug">
                            {order.name}
                          </div>
                          {targetItem && (
                            <span className="font-mono text-[11px] text-slate-400">
                              {targetItem.inventoryCode} • {targetItem.location}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 font-medium text-slate-600">
                        {order.category}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3 text-center">
                        <span className={`font-extrabold font-mono text-sm ${
                          order.currentStock === 0 ? 'text-rose-600' : 'text-slate-800'
                        }`}>
                          {order.currentStock}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{order.unit}</span>
                      </td>

                      {/* Recommended to Order */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-black font-mono text-sm">
                          +{order.recommendedOrder} {order.unit}
                        </span>
                      </td>

                      {/* Urgency */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.urgency === 'CRITICAL' ? 'bg-rose-600 text-white' :
                          order.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.urgency === 'CRITICAL' ? 'Crítica' : order.urgency === 'HIGH' ? 'Alta' : 'Bajo Stock'}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {order.reason}
                      </td>

                      {/* Est. Cost */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                        ${((order.estimatedUnitPrice || 0) * order.recommendedOrder).toLocaleString()} MXN
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <select
                          value={order.status}
                          onChange={(e) => updateRestockOrderStatus(order.id, e.target.value as any)}
                          className={`py-1 px-2 rounded-lg text-[11px] font-bold border outline-none cursor-pointer ${
                            order.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                            order.status === 'ORDERED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            order.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="PENDING">⏳ Pendiente</option>
                          <option value="APPROVED">✓ Aprobada</option>
                          <option value="ORDERED">📦 Ordenada</option>
                          <option value="RECEIVED">🎉 Recibida</option>
                        </select>
                      </td>

                      {/* Quick Action */}
                      <td className="py-3 px-3.5 text-right no-print">
                        {targetItem && (
                          <button
                            onClick={() => setSelectedItem(targetItem)}
                            className="text-teal-700 hover:text-teal-900 font-bold"
                          >
                            Ver Ficha
                          </button>
                        )}
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
  );
};
