export type ConditionStatus = 
  | 'EXCELLENT'          // Buen estado / Operativo
  | 'FAIR'               // Regular / Lijadas / Con uso
  | 'NEEDS_CALIBRATION'  // Requiere calibración (ej. balanzas)
  | 'DAMAGED'            // Desgastado / Quemado / Oxidado / Rayado
  | 'BROKEN';            // Roto / Quebrado / Inoperable

export type StockStatus = 
  | 'ADEQUATE'          // Stock Óptimo / Suficiente
  | 'LOW_STOCK'         // Stock Bajo
  | 'CRITICAL_RESTOCK'  // Reabastecimiento Crítico / Agotado / Dañado
  | 'OUT_OF_STOCK'      // Sin existencias (0)
  | 'SURPLUS';          // Excedente / Alto volumen

export type RestockUrgency = 'NORMAL' | 'LOW_STOCK' | 'HIGH' | 'CRITICAL';

export interface InventoryItem {
  id: string;
  inventoryCode: string;
  category: string;
  name: string;
  type: string;
  volume?: string;
  material?: string;
  classification?: string;
  brand?: string;
  model?: string;
  specifications?: string;
  quantity: number;
  unit: string;
  observations?: string;
  conditionStatus: ConditionStatus;
  conditionLabel: string;
  conditionBadgeColor: string;
  location: string;
  locationDetails?: string;
  custodian: string;
  custodianDepartment?: string;
  minThreshold: number;
  stockStatus: StockStatus;
  restockNeeded: boolean;
  restockUrgency: RestockUrgency;
  lastAuditDate?: string;
  auditStatus?: string;
  notes?: string;
}

export interface LocationRecord {
  code: string | number;
  place: string;
  description: string;
  custodian: string;
}

export interface CustodyRecord {
  custodianName: string;
  department: string;
  labName?: string;
  itemsAssigned: InventoryItem[];
  totalUnits: number;
}

export interface RestockOrderPlan {
  id: string;
  itemId: string;
  name: string;
  category: string;
  currentStock: number;
  recommendedOrder: number;
  unit: string;
  urgency: RestockUrgency;
  reason: string;
  estimatedUnitPrice?: number;
  status: 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED';
  supplier?: string;
}

export interface CustodyTransferLog {
  id: string;
  itemId: string;
  itemName: string;
  inventoryCode: string;
  fromCustodian: string;
  toCustodian: string;
  transferDate: string;
  expectedReturnDate?: string;
  reason: string;
  status: 'ACTIVE' | 'RETURNED';
}

export interface MaintenanceLog {
  id: string;
  itemId: string;
  itemName: string;
  date: string;
  type: 'CALIBRATION' | 'REPAIR' | 'INSPECTION' | 'CLEANING';
  performedBy: string;
  notes: string;
  cost?: number;
  nextDueDate?: string;
}

export type ActiveTab = 'dashboard' | 'inventory' | 'custody' | 'condition' | 'restock' | 'scanner';
