import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Scale, 
  ShoppingCart, 
  ArrowRight, 
  FlaskConical, 
  Layers, 
  ShieldAlert, 
  Clock, 
  Wrench, 
  Sparkles,
  Search
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem } from '../types';

export const DashboardView: React.FC = () => {
  const { 
    items, 
    stats, 
    categories, 
    setActiveTab, 
    setSelectedCategory, 
    setSelectedStockStatus, 
    setSelectedCondition, 
    setSearchQuery,
    setSelectedItem,
    custodyLogs
  } = useInventory();

  // Category counts and status
  const categoryStats = React.useMemo(() => {
    const map = new Map<string, { totalItems: number; totalUnits: number; needsRestock: number; damaged: number }>();
    
    categories.forEach(cat => {
      map.set(cat, { totalItems: 0, totalUnits: 0, needsRestock: 0, damaged: 0 });
    });

    items.forEach(item => {
      const current = map.get(item.category) || { totalItems: 0, totalUnits: 0, needsRestock: 0, damaged: 0 };
      current.totalItems += 1;
      current.totalUnits += typeof item.quantity === 'number' ? item.quantity : 1;
      if (item.restockNeeded) current.needsRestock += 1;
      if (item.conditionStatus === 'DAMAGED' || item.conditionStatus === 'BROKEN' || item.conditionStatus === 'NEEDS_CALIBRATION') {
        current.damaged += 1;
      }
      map.set(item.category, current);
    });

    return Array.from(map.entries()).map(([category, data]) => ({
      category,
      ...data
    })).sort((a, b) => b.totalItems - a.totalItems);
  }, [items, categories]);

  // Critical items needing immediate restock
  const criticalRestockItems = React.useMemo(() => {
    return items
      .filter(i => i.restockNeeded)
      .sort((a, b) => {
        if (a.restockUrgency === 'CRITICAL') return -1;
        if (b.restockUrgency === 'CRITICAL') return 1;
        return a.quantity - b.quantity;
      })
      .slice(0, 5);
  }, [items]);

  // High-value / lab equipment needing calibration or attention
  const equipmentNeedingAttention進 = React.useMemo(() => {
    return items
      .filter(i => i.conditionStatus === 'NEEDS_CALIBRATION' || (i.category === 'EQUIPOS' && (i.conditionStatus === 'DAMAGED' || i.observations?.toLowerCase().includes('calibrar'))))
      .slice(0, 4);
  }, [items]);

  const stockOkPercent = Math.round((stats.okStockCount / stats.totalItems) * 100) || 0;
  const restockPercentSpinner = 100 - stockOkPercent;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Direct Answer to User Prompt */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Diagnóstico Integral del Inventario FCM
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Resumen de Existencias, Custodias y Salud de Stock
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-3xl">
            El almacén cuenta actualmente con <strong className="text-white">{stats.totalItems.toLocaleString()} productos registrados</strong> ({stats.totalUnits.toLocaleString()} unidades físicas) distribuidos en 18 categorías de laboratorio.
            Actualmente <strong className="text-emerald-300">{stats.okStockCount} productos ({stockOkPercent}%)</strong> están en nivel óptimo, mientras que <strong className="text-rose-300">{stats.needsRestockCount} artículos</strong> presentan stock bajo o piezas dañadas que requieren reabastecimiento.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setSelectedStockStatus('RESTOCK_NEEDED');
                setActiveTab('restock');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Ver Plan de Reabastecimiento ({stats.needsRestockCount})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('custody');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-xs border border-white/15 transition-all"
            >
              <Users className="w-4 h-4 text-teal-300" />
              <span>Ver ¿Quién tiene cada equipo?</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('inventory');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-xs border border-white/15 transition-all"
            >
              <Package className="w-4 h-4 text-teal-300" />
              <span>Explorar Todo el Catálogo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Products */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Productos</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalItems.toLocaleString()}</span>
            <span className="text-xs text-slate-500">en {stats.categoriesCount} categorías</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between pt-3 border-t border-slate-100">
            <span>{stats.totalUnits.toLocaleString()} unidades totales</span>
            <span className="text-teal-700 font-semibold flex items-center gap-1">Ver todos <ArrowRight className="w-3 h-3" /></span>
          </div>
        </div>

        {/* Card 2: Stock Health / Restock Status */}
        <div 
          onClick={() => {
            setSelectedStockStatus('RESTOCK_NEEDED');
            setActiveTab('restock');
          }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado de Stock</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">{stats.needsRestockCount}</span>
            <span className="text-xs font-medium text-slate-500">artículos a reabastecer</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-emerald-700 font-semibold">{stats.okStockCount} están OK ({stockOkPercent}%)</span>
            <span className="text-rose-700 font-semibold flex items-center gap-1">Requisición <ArrowRight className="w-3 h-3" /></span>
          </div>
        </div>

        {/* Card 3: Custodians & Active Labs */}
        <div 
          onClick={() => setActiveTab('custody')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custodia y Labs</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-950">{stats.custodiansCount}</span>
            <span className="text-xs text-slate-500">investigadores / labs</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between pt-3 border-t border-slate-100">
            <span>{stats.locationsCount} ubicaciones / gavetas</span>
            <span className="text-indigo-700 font-semibold flex items-center gap-1">Ver préstamos <ArrowRight className="w-3 h-3" /></span>
          </div>
        </div>

        {/* Card 4: Equipment & Calibrations */}
        <div 
          onClick={() => {
            setSelectedCondition('NEEDS_CALIBRATION');
            setActiveTab('condition');
          }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calibración y Daños</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">{stats.damagedCount + stats.calibrationCount}</span>
            <span className="text-xs text-slate-500">con observaciones</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between pt-3 border-t border-slate-100">
            <span>{stats.calibrationCount} balanzas a calibrar</span>
            <span className="text-amber-800 font-semibold flex items-center gap-1">Revisar <ArrowRight className="w-3 h-3" /></span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent Restock Highlights & High Value Equipment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Urgent Restock Needs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Artículos Críticos para Reabastecer
              </h3>
            </div>
            <button
              onClick={() => {
                setSelectedStockStatus('RESTOCK_NEEDED');
                setActiveTab('restock');
              }}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              Ver todos ({stats.needsRestockCount}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {criticalRestockItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-200 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{item.inventoryCode}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-medium truncate">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                    {item.name} {item.volume ? `(${item.volume})` : ''} {item.specifications ? `- ${item.specifications}` : ''}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    Ubicación: <strong className="text-slate-700">{item.location}</strong> • Responsable: {item.custodian}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-rose-600">
                    {item.quantity} {item.unit}
                  </div>
                  <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold mt-1">
                    {item.quantity === 0 ? 'Agotado' : 'Stock Crítico'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Equipment Needing Maintenance / Calibration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Wrench className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Equipos y Balanzas que Requieren Calibración
              </h3>
            </div>
            <button
              onClick={() => {
                setSelectedCondition('NEEDS_CALIBRATION');
                setActiveTab('condition');
              }}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              Auditoría Completa <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {equipmentNeedingAttention進.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-amber-50/50 hover:border-amber-200 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{item.inventoryCode}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium truncate">
                      {item.brand || 'Laboratorio'} {item.model || ''}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                    {item.name} {item.specifications ? `(${item.specifications})` : ''}
                  </h4>
                  <p className="text-xs text-amber-900 font-medium truncate">
                    Nota: {item.observations || 'Requiere calibración periódica'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block text-xs px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold">
                    Calibrar
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {item.custodian.split(' ')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Grid with Quick Filtering */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Inventario por Categorías de Laboratorio
            </h3>
            <p className="text-xs text-slate-500">
              Haz clic en cualquier categoría para filtrar instantáneamente los productos
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            18 Categorías Registradas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {categoryStats.map(({ category, totalItems, totalUnits, needsRestock, damaged }) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setActiveTab('inventory');
              }}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider truncate">
                    {category}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-xl font-extrabold text-slate-900">
                  {totalItems} <span className="text-xs font-normal text-slate-500">artículos</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {totalUnits.toLocaleString()} unidades físicas
                </p>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-200/60 text-[11px]">
                {needsRestock > 0 ? (
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                    {needsRestock} a reabastecer
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                    Stock OK
                  </span>
                )}
                {damaged > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                    {damaged} obs.
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
