import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  InventoryItem, 
  ConditionStatus, 
  StockStatus, 
  RestockUrgency, 
  RestockOrderPlan, 
  CustodyTransferLog, 
  MaintenanceLog,
  ActiveTab,
  LocationRecord
} from '../types';
import { INITIAL_INVENTORY, FCM_LOCATIONS, DEFAULT_SHEET_URL } from '../data/initialInventory';
import { evaluateCondition, evaluateStock } from '../utils/inventoryUtils';
import confetti from 'canvas-confetti';

interface InventoryContextType {
  items: InventoryItem[];
  filteredItems: InventoryItem[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedCondition: string;
  setSelectedCondition: (cond: string) => void;
  selectedStockStatus: string;
  setSelectedStockStatus: (status: string) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  selectedCustodian: string;
  setSelectedCustodian: (custodian: string) => void;
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
  
  // Modals & Active Item
  selectedItem: InventoryItem | null;
  setSelectedItem: (item: InventoryItem | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;
  isTagModalOpen: boolean;
  setIsTagModalOpen: (open: boolean) => void;
  
  // Actions
  updateItemQuantity: (id: string, delta: number) => void;
  updateItemCondition: (id: string, condition: ConditionStatus, observations?: string) => void;
  transferCustody: (itemId: string, newCustodian: string, newLocation: string, reason: string) => void;
  addNewItem: (item: Partial<InventoryItem>) => void;
  updateItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
  resetToDefault: () => void;
  
  // Restock Order Plans
  restockOrders: RestockOrderPlan[];
  updateRestockOrderStatus: (orderId: string, status: RestockOrderPlan['status']) => void;
  addCustomRestockOrder: (order: RestockOrderPlan) => void;
  removeRestockOrder: (orderId: string) => void;
  
  // Logs
  custodyLogs: CustodyTransferLog[];
  maintenanceLogs: MaintenanceLog[];
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => void;
  
  // Stats
  stats: {
    totalItems: number;
    totalUnits: number;
    needsRestockCount: number;
    okStockCount: number;
    damagedCount: number;
    calibrationCount: number;
    categoriesCount: number;
    custodiansCount: number;
    locationsCount: number;
  };
  
  // Categories & Metadata
  categories: string[];
  locations: LocationRecord[];
  custodiansList: string[];
  
  // Quick Filter Presets
  applyPreset: (preset: 'all' | 'restock' | 'damaged' | 'calibration' | 'equipment' | 'custody') => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY = 'unilab_inventory_fcm_v2';
const RESTOCK_STORAGE_KEY = 'unilab_restock_orders_v2';
const CUSTODY_LOGS_KEY = 'unilab_custody_logs_v2';
const MAINT_LOGS_KEY = 'unilab_maint_logs_v2';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading inventory from storage', e);
    }
    return INITIAL_INVENTORY;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCondition, setSelectedCondition] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedCustodian, setSelectedCustodian] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Custody Logs
  const [custodyLogs, setCustodyLogs] = useState<CustodyTransferLog[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTODY_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'cust-1',
        itemId: 'item-10',
        itemName: 'Balanza Granataria OHAUS',
        inventoryCode: 'FCM-EQU-0010',
        fromCustodian: 'Almacén Central FCM',
        toCustodian: 'Amara Thayde Sanchez',
        transferDate: '2026-08-10',
        expectedReturnDate: '2026-12-15',
        reason: 'Prácticas de laboratorio Bioquímica II',
        status: 'ACTIVE'
      },
      {
        id: 'cust-2',
        itemId: 'item-4',
        itemName: 'Anemómetro Kestrel 2000',
        inventoryCode: 'FCM-EQU-0004',
        fromCustodian: 'Almacén Central FCM',
        toCustodian: 'Reginaldo Durazo Arvizu',
        transferDate: '2026-08-18',
        reason: 'Campaña oceanográfica en Bahía de Todos Santos',
        status: 'ACTIVE'
      }
    ];
  });

  // Maintenance Logs
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(() => {
    try {
      const saved = localStorage.getItem(MAINT_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'maint-1',
        itemId: 'item-10',
        itemName: 'Balanza Granataria Ohaus Triple Beam',
        date: '2026-08-01',
        type: 'CALIBRATION',
        performedBy: 'Técnico Metrología FCM',
        notes: 'Ajuste de pesas patrón y nivelación de cuchillas.'
      },
      {
        id: 'maint-2',
        itemId: 'item-1',
        itemName: 'Bureta 10 mL Vidrio Clase A',
        date: '2026-08-05',
        type: 'INSPECTION',
        performedBy: 'Amara Thayde Sanchez',
        notes: 'Verificación de llaves de teflón y ausencia de fugas.'
      }
    ];
  });

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save items', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTODY_LOGS_KEY, JSON.stringify(custodyLogs));
    } catch (e) {}
  }, [custodyLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(MAINT_LOGS_KEY, JSON.stringify(maintenanceLogs));
    } catch (e) {}
  }, [maintenanceLogs]);

  // Derived Restock Orders
  const [customRestockOrders, setCustomRestockOrders] = useState<RestockOrderPlan[]>(() => {
    try {
      const saved = localStorage.getItem(RESTOCK_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const restockOrders = useMemo<RestockOrderPlan[]>(() => {
    // Generate automatic restock plans for all items needing restock
    const autoOrders: RestockOrderPlan[] = items
      .filter(item => item.restockNeeded)
      .map(item => {
        const orderDeficit = Math.max(1, (item.minThreshold * 2) - Math.max(0, item.quantity));
        const estimatedPrice = item.category === 'EQUIPOS' ? 8500 : 
                               item.category.includes('PIPETAS') || item.category.includes('TUBOS') ? 45 :
                               item.category.includes('MATRACES') || item.category.includes('BURETAS') ? 320 : 150;
        
        const existingCustom = customRestockOrders.find(o => o.itemId === item.id);
        if (existingCustom) return existingCustom;

        return {
          id: `restock-${item.id}`,
          itemId: item.id,
          name: `${item.name} ${item.volume ? `(${item.volume})` : ''} ${item.brand ? `- ${item.brand}` : ''}`,
          category: item.category,
          currentStock: item.quantity,
          recommendedOrder: orderDeficit,
          unit: item.unit,
          urgency: item.restockUrgency,
          reason: item.quantity === 0 ? 'Agotado (0 en almacén)' : 
                  item.conditionStatus === 'BROKEN' ? 'Reemplazo por rotura/daño' :
                  `Stock bajo (< ${item.minThreshold} unidades requeridas)`,
          estimatedUnitPrice: estimatedPrice,
          status: 'PENDING',
          supplier: item.category === 'EQUIPOS' ? 'Equipos y Metrología Científica SA' : 'Distribuidora Química de Baja California'
        };
      });

    return autoOrders;
  }, [items, customRestockOrders]);

  // Unique lists
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => { if (i.category) set.add(i.category); });
    return Array.from(set).sort();
  }, [items]);

  const locations = useMemo(() => {
    return FCM_LOCATIONS;
  }, []);

  const custodiansList = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => { if (i.custodian) set.add(i.custodian); });
    return Array.from(set).sort();
  }, [items]);

  // Filtering
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter(item => {
      // Search match
      if (query) {
        const matchName = item.name.toLowerCase().includes(query);
        const matchCode = item.inventoryCode.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        const matchMat = (item.material || '').toLowerCase().includes(query);
        const matchBrand = (item.brand || '').toLowerCase().includes(query);
        const matchModel = (item.model || '').toLowerCase().includes(query);
        const matchObs = (item.observations || '').toLowerCase().includes(query);
        const matchCustodian = (item.custodian || '').toLowerCase().includes(query);
        const matchLoc = (item.location || '').toLowerCase().includes(query);
        const matchSpecs = (item.specifications || '').toLowerCase().includes(query);

        if (!matchName && !matchCode && !matchCat && !matchMat && !matchBrand && !matchModel && !matchObs && !matchCustodian && !matchLoc && !matchSpecs) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // Condition filter
      if (selectedCondition !== 'ALL' && item.conditionStatus !== selectedCondition) {
        return false;
      }

      // Stock filter
      if (selectedStockStatus !== 'ALL') {
        if (selectedStockStatus === 'RESTOCK_NEEDED' && !item.restockNeeded) return false;
        if (selectedStockStatus === 'STOCK_OK' && item.restockNeeded) return false;
        if (selectedStockStatus === 'LOW_STOCK' && item.stockStatus !== 'LOW_STOCK') return false;
        if (selectedStockStatus === 'SURPLUS' && item.stockStatus !== 'SURPLUS') return false;
      }

      // Location filter
      if (selectedLocation !== 'ALL' && !item.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // Custodian filter
      if (selectedCustodian !== 'ALL' && item.custodian !== selectedCustodian) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedCondition, selectedStockStatus, selectedLocation, selectedCustodian]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalUnits = 0;
    let needsRestockCount = 0;
    let damagedCount = 0;
    let calibrationCount = 0;
    const catSet = new Set<string>();
    const custSet = new Set<string>();
    const locSet = new Set<string>();

    items.forEach(item => {
      totalUnits += typeof item.quantity === 'number' ? item.quantity : 1;
      if (item.restockNeeded) needsRestockCount++;
      if (item.conditionStatus === 'DAMAGED' || item.conditionStatus === 'BROKEN') damagedCount++;
      if (item.conditionStatus === 'NEEDS_CALIBRATION') calibrationCount++;
      catSet.add(item.category);
      if (item.custodian) custSet.add(item.custodian);
      if (item.location) locSet.add(item.location);
    });

    return {
      totalItems: items.length,
      totalUnits,
      needsRestockCount,
      okStockCount: items.length - needsRestockCount,
      damagedCount,
      calibrationCount,
      categoriesCount: catSet.size,
      custodiansCount: custSet.size,
      locationsCount: locSet.size
    };
  }, [items]);

  // Handlers
  const updateItemQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = Math.max(0, item.quantity + delta);
      const stockInfo = evaluateStock(newQty, item.category, item.conditionStatus);
      return {
        ...item,
        quantity: newQty,
        stockStatus: stockInfo.stockStatus,
        restockNeeded: stockInfo.restockNeeded,
        restockUrgency: stockInfo.restockUrgency
      };
    }));
  };

  const updateItemCondition = (id: string, newStatus: ConditionStatus, observations?: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const evaluated = evaluateCondition(observations || item.observations);
      const stockInfo = evaluateStock(item.quantity, item.category, newStatus);
      
      const updatedItem: InventoryItem = {
        ...item,
        conditionStatus: newStatus,
        conditionLabel: evaluated.label,
        conditionBadgeColor: evaluated.badgeColor,
        observations: observations !== undefined ? observations : item.observations,
        stockStatus: stockInfo.stockStatus,
        restockNeeded: stockInfo.restockNeeded,
        restockUrgency: stockInfo.restockUrgency,
        lastAuditDate: new Date().toISOString().split('T')[0],
        auditStatus: 'Verificado'
      };

      if (selectedItem?.id === id) {
        setSelectedItem(updatedItem);
      }

      return updatedItem;
    }));
  };

  const transferCustody = (itemId: string, newCustodian: string, newLocation: string, reason: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const oldCustodian = item.custodian;

    setItems(prev => prev.map(i => {
      if (i.id !== itemId) return i;
      const updated: InventoryItem = {
        ...i,
        custodian: newCustodian,
        location: newLocation,
        locationDetails: `Asignado a ${newCustodian} (${newLocation})`,
        lastAuditDate: new Date().toISOString().split('T')[0]
      };
      if (selectedItem?.id === itemId) {
        setSelectedItem(updated);
      }
      return updated;
    }));

    const newLog: CustodyTransferLog = {
      id: `cust-${Date.now()}`,
      itemId,
      itemName: item.name,
      inventoryCode: item.inventoryCode,
      fromCustodian: oldCustodian,
      toCustodian: newCustodian,
      transferDate: new Date().toISOString().split('T')[0],
      reason,
      status: 'ACTIVE'
    };

    setCustodyLogs(prev => [newLog, ...prev]);

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.85 } });
    } catch (e) {}
  };

  const addNewItem = (newItemData: Partial<InventoryItem>) => {
    const id = `item-${Date.now()}`;
    const category = newItemData.category || 'MATERIAL DE USO MÚLTIPLE';
    const code = newItemData.inventoryCode || `FCM-${category.slice(0, 3).toUpperCase()}-${String(items.length + 1).padStart(4, '0')}`;
    const condition = evaluateCondition(newItemData.observations);
    const stockInfo = evaluateStock(newItemData.quantity || 1, category, condition.status);

    const fullItem: InventoryItem = {
      id,
      inventoryCode: code,
      category,
      name: newItemData.name || 'Nuevo Producto',
      type: newItemData.type || '',
      volume: newItemData.volume || '',
      material: newItemData.material || '',
      classification: newItemData.classification || '',
      brand: newItemData.brand || '',
      model: newItemData.model || '',
      specifications: newItemData.specifications || '',
      quantity: newItemData.quantity !== undefined ? newItemData.quantity : 1,
      unit: newItemData.unit || 'unidades',
      observations: newItemData.observations || '',
      conditionStatus: condition.status,
      conditionLabel: condition.label,
      conditionBadgeColor: condition.badgeColor,
      location: newItemData.location || 'Almacén Central FCM',
      locationDetails: newItemData.locationDetails || 'Almacén Central FCM - Estante General',
      custodian: newItemData.custodian || 'Almacén Central FCM',
      custodianDepartment: newItemData.custodianDepartment || 'Coordinación de Almacén',
      minThreshold: newItemData.minThreshold || stockInfo.minThreshold,
      stockStatus: stockInfo.stockStatus,
      restockNeeded: stockInfo.restockNeeded,
      restockUrgency: stockInfo.restockUrgency,
      lastAuditDate: new Date().toISOString().split('T')[0],
      auditStatus: 'Registrado'
    };

    setItems(prev => [fullItem, ...prev]);
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    } catch (e) {}
  };

  const updateItem = (updatedItem: InventoryItem) => {
    const stockInfo = evaluateStock(updatedItem.quantity, updatedItem.category, updatedItem.conditionStatus);
    const itemWithCalculatedStock: InventoryItem = {
      ...updatedItem,
      stockStatus: stockInfo.stockStatus,
      restockNeeded: stockInfo.restockNeeded,
      restockUrgency: stockInfo.restockUrgency
    };

    setItems(prev => prev.map(i => i.id === updatedItem.id ? itemWithCalculatedStock : i));
    if (selectedItem?.id === updatedItem.id) {
      setSelectedItem(itemWithCalculatedStock);
    }
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const resetToDefault = () => {
    setItems(INITIAL_INVENTORY);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RESTOCK_STORAGE_KEY);
    localStorage.removeItem(CUSTODY_LOGS_KEY);
    localStorage.removeItem(MAINT_LOGS_KEY);
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedCondition('ALL');
    setSelectedStockStatus('ALL');
    setSelectedLocation('ALL');
    setSelectedCustodian('ALL');
  };

  const updateRestockOrderStatus = (orderId: string, status: RestockOrderPlan['status']) => {
    setCustomRestockOrders(prev => {
      const existing = prev.find(o => o.id === orderId);
      if (existing) {
        return prev.map(o => o.id === orderId ? { ...o, status } : o);
      }
      const target = restockOrders.find(o => o.id === orderId);
      if (target) {
        return [...prev, { ...target, status }];
      }
      return prev;
    });
  };

  const addCustomRestockOrder = (order: RestockOrderPlan) => {
    setCustomRestockOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
  };

  const removeRestockOrder = (orderId: string) => {
    setCustomRestockOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const addMaintenanceLog = (logData: Omit<MaintenanceLog, 'id'>) => {
    const newLog: MaintenanceLog = {
      ...logData,
      id: `maint-${Date.now()}`
    };
    setMaintenanceLogs(prev => [newLog, ...prev]);
  };

  const applyPreset = (preset: 'all' | 'restock' | 'damaged' | 'calibration' | 'equipment' | 'custody') => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedCondition('ALL');
    setSelectedStockStatus('ALL');
    setSelectedLocation('ALL');
    setSelectedCustodian('ALL');

    if (preset === 'restock') {
      setSelectedStockStatus('RESTOCK_NEEDED');
      setActiveTab('restock');
    } else if (preset === 'damaged') {
      setSelectedCondition('DAMAGED');
      setActiveTab('condition');
    } else if (preset === 'calibration') {
      setSelectedCondition('NEEDS_CALIBRATION');
      setActiveTab('condition');
    } else if (preset === 'equipment') {
      setSelectedCategory('EQUIPOS');
      setActiveTab('inventory');
    } else if (preset === 'custody') {
      setActiveTab('custody');
    } else {
      setActiveTab('inventory');
    }
  };

  return (
    <InventoryContext.Provider value={{
      items,
      filteredItems,
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      selectedCondition,
      setSelectedCondition,
      selectedStockStatus,
      setSelectedStockStatus,
      selectedLocation,
      setSelectedLocation,
      selectedCustodian,
      setSelectedCustodian,
      viewMode,
      setViewMode,
      selectedItem,
      setSelectedItem,
      isAddModalOpen,
      setIsAddModalOpen,
      isTransferModalOpen,
      setIsTransferModalOpen,
      isSyncModalOpen,
      setIsSyncModalOpen,
      isTagModalOpen,
      setIsTagModalOpen,
      updateItemQuantity,
      updateItemCondition,
      transferCustody,
      addNewItem,
      updateItem,
      deleteItem,
      resetToDefault,
      restockOrders,
      updateRestockOrderStatus,
      addCustomRestockOrder,
      removeRestockOrder,
      custodyLogs,
      maintenanceLogs,
      addMaintenanceLog,
      stats,
      categories,
      locations,
      custodiansList,
      applyPreset
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
