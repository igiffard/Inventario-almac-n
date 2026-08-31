import * as XLSX from 'xlsx';
import { InventoryItem, ConditionStatus, StockStatus, RestockUrgency, RestockOrderPlan } from '../types';

export function evaluateCondition(observations?: string): { status: ConditionStatus; label: string; badgeColor: string } {
  const obs = String(observations || '').toUpperCase();
  if (!obs || obs === 'SIN ASTILLADAS' || obs.includes('BUEN ESTADO') || obs.includes('NUEVO') || obs.includes('ESTÉRILES') || obs.includes('CALIBRADA')) {
    return { status: 'EXCELLENT', label: 'Excelente / Operativo', badgeColor: 'emerald' };
  }
  if (obs.includes('ROTA') || obs.includes('INOPERABLE') || obs.includes('QUEBRADO')) {
    return { status: 'BROKEN', label: 'Roto / Inoperable', badgeColor: 'rose' };
  }
  if (obs.includes('CALIBRAR') || obs.includes('AJUSTAR') || obs.includes('MARGEN DE ERROR')) {
    return { status: 'NEEDS_CALIBRATION', label: 'Requiere Calibración', badgeColor: 'amber' };
  }
  if (obs.includes('QUEMADA') || obs.includes('QUEMADO') || obs.includes('OXIDADA') || obs.includes('OXIDADO') || obs.includes('RAYADO') || obs.includes('SIN PUNTA') || obs.includes('DESGASTAD')) {
    return { status: 'DAMAGED', label: 'Desgastado / Dañado', badgeColor: 'orange' };
  }
  if (obs.includes('LIJADA') || obs.includes('LIJADAS') || obs.includes('ETIQUETA') || obs.includes('MUESTRA') || obs.includes('TALLA')) {
    return { status: 'FAIR', label: 'Regular / Marcado', badgeColor: 'blue' };
  }
  return { status: 'FAIR', label: 'Regular', badgeColor: 'slate' };
}

export function evaluateStock(quantity: number, category: string, conditionStatus: ConditionStatus): {
  minThreshold: number;
  stockStatus: StockStatus;
  restockNeeded: boolean;
  restockUrgency: RestockUrgency;
} {
  let minThreshold = 2;
  const cat = (category || '').toUpperCase();
  if (cat.includes('TUBOS') || cat.includes('PIPETAS') || cat.includes('VASOS')) minThreshold = 10;
  if (cat.includes('LIMPIEZA') || cat.includes('MÚLTIPLE')) minThreshold = 5;
  if (cat.includes('SEGURIDAD')) minThreshold = 4;
  if (cat.includes('EQUIPOS') || cat.includes('BALANZA')) minThreshold = 1;

  let restockNeeded = false;
  let restockUrgency: RestockUrgency = 'NORMAL';
  let stockStatus: StockStatus = 'ADEQUATE';

  if (conditionStatus === 'BROKEN' || conditionStatus === 'DAMAGED') {
    if (quantity <= 2) {
      restockNeeded = true;
      restockUrgency = 'HIGH';
      stockStatus = 'CRITICAL_RESTOCK';
    }
  }

  if (quantity === 0) {
    restockNeeded = true;
    restockUrgency = 'CRITICAL';
    stockStatus = 'OUT_OF_STOCK';
  } else if (quantity < minThreshold) {
    restockNeeded = true;
    restockUrgency = restockUrgency === 'HIGH' ? 'HIGH' : 'LOW_STOCK';
    stockStatus = 'LOW_STOCK';
  } else if (quantity > minThreshold * 4) {
    stockStatus = 'SURPLUS';
  }

  return { minThreshold, stockStatus, restockNeeded, restockUrgency };
}

export function exportInventoryToExcel(items: InventoryItem[], filename = 'Inventario_FCM_UABC_2026.xlsx') {
  const exportRows = items.map(item => ({
    'Código FCM': item.inventoryCode,
    'Categoría': item.category,
    'Nombre / Producto': item.name,
    'Tipo': item.type || '',
    'Volumen': item.volume || '',
    'Material': item.material || '',
    'Clasificación': item.classification || '',
    'Marca': item.brand || '',
    'Modelo': item.model || '',
    'Especificaciones': item.specifications || '',
    'Cantidad': item.quantity,
    'Unidad': item.unit,
    'Condición': item.conditionLabel,
    'Estado de Stock': item.restockNeeded ? 'REABASTECER NECESARIO' : 'STOCK OK',
    'Ubicación': item.location,
    'Detalle Ubicación': item.locationDetails || '',
    'Responsable / Custodio': item.custodian,
    'Departamento': item.custodianDepartment || '',
    'Observaciones': item.observations || '',
    'Última Auditoría': item.lastAuditDate || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario General');
  XLSX.writeFile(workbook, filename);
}

export function exportRestockPlanToExcel(plans: RestockOrderPlan[], filename = 'Requisicion_Compras_Lab_FCM.xlsx') {
  const exportRows = plans.map(p => ({
    'Código / ID': p.itemId,
    'Producto / Material': p.name,
    'Categoría': p.category,
    'Stock Actual': p.currentStock,
    'Cantidad a Pedir': p.recommendedOrder,
    'Unidad': p.unit,
    'Urgencia': p.urgency,
    'Motivo': p.reason,
    'Proveedor Sugerido': p.supplier || 'Catálogo General Reactivos / Vidriería',
    'Precio Unit. Est. (MXN)': p.estimatedUnitPrice || 0,
    'Total Est. (MXN)': (p.estimatedUnitPrice || 0) * p.recommendedOrder,
    'Estado Requisición': p.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Requisición de Compras');
  XLSX.writeFile(workbook, filename);
}
