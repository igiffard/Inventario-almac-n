# UniLab Inventory & Asset Manager 🔬📊
### Sistema de Control de Almacén e Inventario — FCM UABC

Sistema web de gestión de inventarios, equipos de laboratorio, vidriería, custodias docentes/estudiantiles, estados físicos/calibración y compras inteligentes. Diseñado para laboratorios universitarios y centros de investigación.

---

## 🌐 1. Publicación en GitHub Pages (con o sin Dominio Personalizado)

El proyecto incluye un flujo de trabajo automatizado con **GitHub Actions** en `.github/workflows/static.yml`.

### Pasos para activar en GitHub:
1. Sube tu código al repositorio en GitHub (`main`).
2. En GitHub, entra a **Settings** > **Pages** (menú izquierdo).
3. En **Build and deployment**:
   - **Source**: Selecciona **GitHub Actions**.
4. ¡Listo! Cada vez que hagas un push a `main`, GitHub compilará el proyecto automáticamente y lo publicará en tu enlace (ej: `https://tu-usuario.github.io/tu-repositorio/`).

### Configurar un Dominio Personalizado (ej. `inventario.uabc.edu.mx`):
1. En GitHub > **Settings** > **Pages** > **Custom domain**.
2. Escribe tu dominio (ej. `inventario.uabc.edu.mx`) y haz clic en **Save**.
3. En tu proveedor de DNS institucional, agrega un registro **CNAME** apuntando a `tu-usuario.github.io`.
4. Marca la casilla **Enforce HTTPS**.

---

## 📌 2. Publicación e Integración en Google Sites

Puedes embeber el sistema de inventario directamente dentro de cualquier página o portal de **Google Sites**:

### Opción A: Por URL (Recomendada)
1. Abre tu sitio en [Google Sites](https://sites.google.com).
2. En el panel derecho, haz clic en **Insertar** (Insert) > **Embeber / Incorporar** (Embed `< >`).
3. Selecciona la pestaña **Por URL** (By URL).
4. Pega la URL pública de tu GitHub Pages (ej. `https://tu-usuario.github.io/tu-repositorio/` o tu dominio personalizado).
5. Selecciona **Página completa** o **Ventana interactiva** y pulsa **Insertar**.
6. Ajusta el ancho y alto del contenedor en el editor de Google Sites para que ocupe todo el espacio deseado.

### Opción B: Mediante Código de Inserción (HTML iframe)
Si prefieres definir dimensiones exactas:
1. En Google Sites > **Insertar** > **Incorporar** > pestaña **Código**.
2. Pega el siguiente código HTML:
   ```html
   <iframe 
     src="https://tu-usuario.github.io/tu-repositorio/" 
     style="width:100%; height:850px; border:none; border-radius:12px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);" 
     allow="clipboard-write"
     title="Inventario FCM UABC">
   </iframe>
   ```
3. Haz clic en **Siguiente** y luego en **Insertar**.

---

## ✨ Características Principales

- 📦 **Catálogo de 1,043 Artículos**: Clasificación por vidriería (buretas, matraces, probetas, pipetas, vasos), materiales de uso específico, reactivos y equipos de precisión.
- 🔄 **Sincronización con Google Sheets**: Conexión al libro de cálculo oficial de la universidad con actualización y restablecimiento inmediato.
- 👤 **Módulo "¿Quién lo Tiene?" (Custodias)**: Registro de transferencias entre profesores, técnicos y alumnos, motivos de préstamo y fechas de devolución.
- 🛠️ **Estado Físico y Calibración**: Detección de material con fisuras/roturas, y control de balanzas analíticas y equipos que requieren calibración metrológica.
- 📈 **Módulo "¿Reabastecer o Todo OK?"**: Cálculo automático de compras sugeridas y presupuestos cuando las existencias caen por debajo del umbral mínimo de seguridad.
- 🏷️ **Generador de Etiquetas de Activo**: Impresión de marbetes con código de barras y formato institucional listos para etiquetado físico.
- 💾 **Exportación Multiformato**: Descarga instantánea en Excel (`.xlsx`) de toda la base de datos o filtros activos.
- 📱 **100% Responsivo e Integrable**: Funciona en computadoras, tabletas, celulares y dentro de iframes en Google Sites.

---

## 🚀 Ejecución Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```

---

## 📄 Licencia
Distribuido bajo licencia MIT. Desarrollado para la Facultad de Ciencias Marinas - Universidad Autónoma de Baja California (UABC).
