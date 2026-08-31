import React from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { InventoryTableView } from './components/InventoryTableView';
import { CustodyView } from './components/CustodyView';
import { ConditionView } from './components/ConditionView';
import { RestockView } from './components/RestockView';

// Modals & Gates
import { AccessGate } from './components/AccessGate';
import { SecurityModal } from './components/SecurityModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AddItemModal } from './components/AddItemModal';
import { CustodyTransferModal } from './components/CustodyTransferModal';
import { SyncSheetModal } from './components/SyncSheetModal';
import { AssetTagModal } from './components/AssetTagModal';

const MainContent: React.FC = () => {
  const { activeTab } = useInventory();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'inventory' && <InventoryTableView />}
      {activeTab === 'custody' && <CustodyView />}
      {activeTab === 'condition' && <ConditionView />}
      {activeTab === 'restock' && <RestockView />}

      {/* Global Modals */}
      <ItemDetailModal />
      <AddItemModal />
      <CustodyTransferModal />
      <SyncSheetModal />
      <AssetTagModal />
      <SecurityModal />
    </main>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AccessGate />;
  }

  return (
    <InventoryProvider>
      <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-teal-700 selection:text-white">
        <Header />
        <Navigation />
        <div className="flex-1">
          <MainContent />
        </div>

        {/* University Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 no-print mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-700">Sistema Activo y Sincronizado</span>
              <span>•</span>
              <span>Universidad Autónoma de Baja California (FCM)</span>
            </div>
            <div className="text-slate-400">
              1,043 Artículos de Laboratorio Registrados • Control de Existencias, Custodias y Calibración
            </div>
          </div>
        </footer>
      </div>
    </InventoryProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

