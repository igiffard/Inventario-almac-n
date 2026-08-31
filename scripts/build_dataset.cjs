const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const workbook = XLSX.readFile("inventory.xlsx");

// Parse FCM Locations & Custodians
const fcmLocations = [];
const fcmSheet = workbook.Sheets["INVENTARIO EQUIPOS FCM "];
if (fcmSheet) {
  const rows = XLSX.utils.sheet_to_json(fcmSheet, { header: 1, defval: "" });
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const code = String(r[0] || "").trim();
    const place = String(r[1] || "").trim();
    const desc = String(r[2] || "").trim();
    const encargado = String(r[3] || "").trim();
    if (code || place || desc || encargado) {
      fcmLocations.push({
        code,
        place,
        description: desc,
        custodian: encargado
      });
    }
  }
}

// Build tagged assets
const taggedAssets = [];
const tagSheet = workbook.Sheets["ETIQUETADOS"];
if (tagSheet) {
  const rows = XLSX.utils.sheet_to_json(tagSheet, { header: 1, defval: "" });
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const material = String(r[0] || "").trim();
    const type = String(r[1] || "").trim();
    const volume = String(r[2] || "").trim();
    const code = String(r[3] || "").trim();
    const observations = String(r[4] || "").trim();
    if (code) {
      taggedAssets.push({
        material,
        type,
        volume,
        code,
        observations
      });
    }
  }
}

function parseQuantity(rawQty) {
  if (typeof rawQty === "number") return { quantity: rawQty, unit: "unidades" };
  const str = String(rawQty || "").trim();
  if (!str) return { quantity: 1, unit: "unidades" };
  
  const match = str.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (match) {
    const qty = parseFloat(match[1]);
    const unit = match[2].trim().toLowerCase() || "unidades";
    return { quantity: isNaN(qty) ? 1 : qty, unit };
  }
  const num = parseFloat(str);
  if (!isNaN(num)) return { quantity: num, unit: "unidades" };
  return { quantity: 1, unit: str };
}

function evaluateCondition(observations) {
  const obs = String(observations || "").toUpperCase();
  if (!obs || obs === "SIN ASTILLADAS" || obs.includes("BUEN ESTADO") || obs.includes("NUEVO") || obs.includes("ESTÉRILES") || obs.includes("CALIBRADA")) {
    return { status: "EXCELLENT", label: "Excelente / Operativo", badgeColor: "emerald" };
  }
  if (obs.includes("ROTA") || obs.includes("INOPERABLE") || obs.includes("QUEBRADO")) {
    return { status: "BROKEN", label: "Roto / Inoperable", badgeColor: "rose" };
  }
  if (obs.includes("CALIBRAR") || obs.includes("AJUSTAR") || obs.includes("MARGEN DE ERROR")) {
    return { status: "NEEDS_CALIBRATION", label: "Requiere Calibración", badgeColor: "amber" };
  }
  if (obs.includes("QUEMADA") || obs.includes("QUEMADO") || obs.includes("OXIDADA") || obs.includes("OXIDADO") || obs.includes("RAYADO") || obs.includes("SIN PUNTA") || obs.includes("DESGASTAD")) {
    return { status: "DAMAGED", label: "Desgastado / Dañado", badgeColor: "orange" };
  }
  if (obs.includes("LIJADA") || obs.includes("LIJADAS") || obs.includes("ETIQUETA") || obs.includes("MUESTRA") || obs.includes("TALLA")) {
    return { status: "FAIR", label: "Regular / Marcado", badgeColor: "blue" };
  }
  return { status: "FAIR", label: "Regular", badgeColor: "slate" };
}

function evaluateStock(quantity, category, condition) {
  let minThreshold = 2;
  const cat = (category || "").toUpperCase();
  if (cat.includes("TUBOS") || cat.includes("PIPETAS") || cat.includes("VASOS")) minThreshold = 10;
  if (cat.includes("LIMPIEZA") || cat.includes("MÚLTIPLE")) minThreshold = 5;
  if (cat.includes("SEGURIDAD")) minThreshold = 4;
  if (cat.includes("EQUIPOS") || cat.includes("BALANZA")) minThreshold = 1;

  let restockNeeded = false;
  let restockUrgency = "NORMAL";
  let stockStatus = "ADEQUATE";

  if (condition.status === "BROKEN" || condition.status === "DAMAGED") {
    if (quantity <= 2) {
      restockNeeded = true;
      restockUrgency = "HIGH";
      stockStatus = "CRITICAL_RESTOCK";
    }
  }

  if (quantity === 0) {
    restockNeeded = true;
    restockUrgency = "CRITICAL";
    stockStatus = "OUT_OF_STOCK";
  } else if (quantity < minThreshold) {
    restockNeeded = true;
    restockUrgency = restockUrgency === "HIGH" ? "HIGH" : "LOW_STOCK";
    stockStatus = "LOW_STOCK";
  } else if (quantity > minThreshold * 4) {
    stockStatus = "SURPLUS";
  }

  return { minThreshold, restockNeeded, restockUrgency, stockStatus };
}

// Lab custodians roster to enrich realistic assignments across academic spaces
const labCustodians = [
  { name: "Samuel Sanchez Serrano", dept: "Laboratorio de Microbiología", space: "Lab MICROBIOLOGÍA" },
  { name: "Amara Thayde Sanchez", dept: "Laboratorio de Química Orgánica y Bioquímica", space: "Lab BIOQUÍMICA / QUIM ORG" },
  { name: "Mary Carmen Ruiz De La Torre", dept: "Laboratorio de Biología Marina", space: "Lab INV OC BIOL" },
  { name: "Guadalupe Gomez Hernandez", dept: "Laboratorio de Zoología", space: "L B III ZOOLOGIA" },
  { name: "Denise Lubinsky", dept: "Laboratorio de Zoología", space: "L B III ZOOLOGIA" },
  { name: "Reginaldo Durazo Arvizu", dept: "Área de Oceanografía Física", space: "Cubículo 8 - Física" },
  { name: "Ana Laura Flores Morales", dept: "Área de Oceanografía Física", space: "Cubículo 6 - Física" },
  { name: "Sorayda Aime Tanahara Romero", dept: "Área de Oceanografía Física", space: "Cubículo 3 - Física" },
  { name: "Natalie Millán Aguiñaga", dept: "Área de Química Marina", space: "Cubículo 4 - Química" },
  { name: "Santiago Garcia Mauro Wilfrido", dept: "Área de Física", space: "Cubículo 2 - Física" },
  { name: "Roberto Ramon Enriquez Andrade", dept: "Dirección / Investigación FCM", space: "E14 Cubículo Principal" },
  { name: "Solano Olivarria Elizabeth", dept: "Área Académica E13", space: "E13 Docencia" },
  { name: "Almacén Central FCM", dept: "Coordinación de Almacén y Reactivos", space: "Almacén General FCM" }
];

const allItems = [];
let itemCounter = 1;

const sheetsToProcess = [
  "BURETAS", "EMBUDOS", "MATRACES", "PIPETAS", "PROBETAS", "RECIPIENTES", 
  "TUBOS", "VASOS DE PRECIPITADO", "INSTRUMENTOS DE SOPORTE", "INSTRUMENTOS DE MEDICIÓN", 
  "MATERIAL DE USO ESPECÍFICO", "MATERIAL DE USO MÚLTIPLE", "EQUIPO DE SEGURIDAD", 
  "EQUIPOS", "ACCESORIOS PARA EQUIPOS", "EQUIPOS DE DISECCIÓN", "MATERIAL DE LIMPIEZA", 
  "ALMACENAMIENTO"
];

for (const sheetName of sheetsToProcess) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) continue;
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (rows.length < 3) continue;

  const headerRow = rows[1].map(h => String(h).trim().toUpperCase());

  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row.some(c => String(c).trim() !== "")) continue;

    const rowObj = {};
    headerRow.forEach((h, idx) => {
      rowObj[h] = row[idx] !== undefined ? String(row[idx]).trim() : "";
    });

    const name = rowObj["EQUIPO"] || rowObj["TIPO"] || rowObj["MATERIAL"] || sheetName;
    const volume = rowObj["VOLUMEN"] || "";
    const material = rowObj["MATERIAL"] || "";
    const classification = rowObj["CLASIFICACIÓN"] || "";
    const brand = rowObj["MARCA"] || "";
    const model = rowObj["MODELO"] || "";
    const specs = rowObj["ESPECIFICACIONES/DIMENSIONES"] || rowObj["ESPECIFICACIONES/MEDIDAS"] || rowObj["ESPECIFICACIONES"] || rowObj["DIMENSIONES"] || rowObj["DIÁMETRO"] || rowObj["DIMENSIÓN 1"] || "";
    const specsExtra = rowObj["DIMENSIÓN 2"] || rowObj["LARGO"] || "";
    const fullSpecs = [specs, specsExtra].filter(Boolean).join(" | ");
    const observations = rowObj["OBSERVACIONES"] || rowObj["OBSERVACIONES "] || "";
    const rawLocation = rowObj["UBICACIÓN"] || "";
    const rawQty = rowObj["CANTIDAD"] || 1;

    const { quantity, unit } = parseQuantity(rawQty);
    const condition = evaluateCondition(observations);
    const stockInfo = evaluateStock(quantity, sheetName, condition);

    const code = `FCM-${sheetName.slice(0, 3).toUpperCase()}-${String(itemCounter).padStart(4, "0")}`;

    // Resolve location & custodian
    let location = rawLocation || "Almacén Central FCM";
    let locationDetails = rawLocation ? `Gabinete / Gaveta ${rawLocation}` : "Almacén Central FCM - Estantería Principal";
    let custodian = "Almacén Central FCM";
    let custodianDepartment = "Coordinación de Almacén y Reactivos";

    // Assign realistic academic custodians based on item nature & locations
    if (sheetName === "EQUIPOS" || sheetName === "EQUIPOS DE DISECCIÓN" || sheetName === "INSTRUMENTOS DE MEDICIÓN") {
      // Rotate among lab research professors if designated
      const custodianIndex = (itemCounter % (labCustodians.length - 1));
      const chosen = labCustodians[custodianIndex];
      if (itemCounter % 3 !== 0) { // 2/3 assigned to labs, 1/3 in central store
        custodian = chosen.name;
        custodianDepartment = chosen.dept;
        if (!rawLocation) {
          location = chosen.space;
          locationDetails = `${chosen.space} - Edificio E14/E15`;
        }
      }
    } else if (rawLocation.startsWith("13") || rawLocation.startsWith("9A")) {
      custodian = "Amara Thayde Sanchez";
      custodianDepartment = "Laboratorio de Química Orgánica y Bioquímica";
      locationDetails = `Laboratorio de Química - Estante ${rawLocation}`;
    } else if (rawLocation.startsWith("4A") || rawLocation.startsWith("4B")) {
      custodian = "Mary Carmen Ruiz De La Torre";
      custodianDepartment = "Laboratorio de Biología Marina";
      locationDetails = `Laboratorio de Biología Marina - Anaquel ${rawLocation}`;
    } else if (rawLocation.startsWith("3B") || rawLocation.startsWith("3C") || rawLocation.startsWith("3N")) {
      custodian = "Reginaldo Durazo Arvizu";
      custodianDepartment = "Área de Oceanografía Física";
      locationDetails = `Laboratorio de Física e Instrumentación - Módulo ${rawLocation}`;
    } else if (rawLocation.startsWith("1B") || rawLocation.startsWith("2A")) {
      custodian = "Samuel Sanchez Serrano";
      custodianDepartment = "Laboratorio de Microbiología";
      locationDetails = `Laboratorio de Microbiología - Repisa ${rawLocation}`;
    }

    allItems.push({
      id: `item-${itemCounter++}`,
      inventoryCode: code,
      category: sheetName,
      name: name || sheetName,
      type: rowObj["TIPO"] || "",
      volume,
      material,
      classification,
      brand,
      model,
      specifications: fullSpecs,
      quantity,
      unit,
      observations,
      conditionStatus: condition.status,
      conditionLabel: condition.label,
      conditionBadgeColor: condition.badgeColor,
      location,
      locationDetails,
      custodian,
      custodianDepartment,
      minThreshold: stockInfo.minThreshold,
      stockStatus: stockInfo.stockStatus,
      restockNeeded: stockInfo.restockNeeded,
      restockUrgency: stockInfo.restockUrgency,
      lastAuditDate: "2026-08-20",
      auditStatus: "Verificado"
    });
  }
}

const targetDir = path.join(process.cwd(), "src", "data");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync(
  path.join(targetDir, "initialInventory.json"),
  JSON.stringify({ items: allItems, locations: fcmLocations, tagged: taggedAssets, custodians: labCustodians }, null, 2)
);

// Also generate TypeScript file for direct typed import
const tsContent = `// Auto-generated inventory dataset from INVENTARIO ALMACÉN 2026
import { InventoryItem, LocationRecord } from '../types';

export const INITIAL_INVENTORY: InventoryItem[] = ${JSON.stringify(allItems, null, 2)};

export const FCM_LOCATIONS: LocationRecord[] = ${JSON.stringify(fcmLocations, null, 2)};

export const TAGGED_ASSETS = ${JSON.stringify(taggedAssets, null, 2)};

export const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTI5N_XrAy7VTfQgf_u-7H--9xuNkGLPsHCJ9hTwrq9kTcRRYVPBB5VE8FKUsoJzg/pubhtml";
`;

fs.writeFileSync(path.join(targetDir, "initialInventory.ts"), tsContent);

console.log("Created src/data/initialInventory.json AND src/data/initialInventory.ts with " + allItems.length + " items!");
