import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Stethoscope, 
  ShoppingCart, 
  QrCode,
  AlertCircle
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ActiveTab } from '../types';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, stats } = useInventory();

  const navItems: { id: ActiveTab; label: string; sub: string; icon: React.ComponentType<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Vista General',
      sub: 'Métricas y Balance',
      icon: LayoutDashboard
    },
    {
      id: 'inventory',
      label: 'Catálogo de Productos',
      sub: `${stats.totalItems} artículos registrados`,
      icon: Package,
      badge: stats.totalItems,
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'custody',
      label: '¿Quién lo Tiene?',
      sub: 'Laboratorios y Responsables',
      icon: Users,
      badge: stats.custodiansCount,
      badgeColor: 'bg-indigo-50 text-indigo-700'
    },
    {
      id: 'condition',
      label: 'Estado y Calibración',
      sub: `${stats.damagedCount + stats.calibrationCount} con observaciones`,
      icon: Stethoscope,
      badge: (stats.damagedCount + stats.calibrationCount) > 0 ? (stats.damagedCount + stats.calibrationCount) : undefined,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'restock',
      label: '¿Reabastecer o Todo OK?',
      sub: 'Planeación de Compras',
      icon: ShoppingCart,
      badge: stats.needsRestockCount > 0 ? stats.needsRestockCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 animate-pulse'
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block font-normal leading-tight">
                    {item.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
