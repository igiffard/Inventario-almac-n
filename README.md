# UniLab Inventory & Asset Manager 🔬📊

A modern, full-featured laboratory and university inventory management system built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**.

Designed specifically for academic faculties, research laboratories, and institutional asset tracking (e.g., UABC - Facultad de Ciencias Marinas).

---

## ✨ Features

- 📦 **Master Inventory Hub**: High-performance searchable and filterable database supporting thousands of catalog items, with categorization, location hierarchy, status filters, and instant sorting.
- 🔄 **Live Google Sheets Synchronization**: Seamless two-way import and live sync from published Google Sheets (CSV/HTML) with automatic column mapping and diff analysis.
- 👤 **Custody & Responsibility Tracking**: Track which professor, technician, or student has custody of specific equipment, historical checkout logs, transfer workflows, and overdue alerts.
- 🛠️ **Condition & Metrology Log**: Inspect equipment physical/operational conditions (`Brand New`, `Good`, `Fair`, `Damaged / Repair Needed`, `Decommissioned`), schedule maintenance, and log calibration history.
- 📈 **Automated Restock & Budget Intelligence**: Real-time restock triggers when inventory dips below minimum safety thresholds, with automated purchase orders and unit cost estimations.
- 🏷️ **Asset Tag & QR / Barcode Generator**: Print-ready thermal and sticker asset tags with formatted barcodes, serial numbers, and scan links.
- 💾 **Multi-Format Export**: One-click export to Excel (`.xlsx`), CSV (`.csv`), or structured JSON for administrative audits and university reporting.
- 🌓 **Offline-First & Local Storage Persistence**: Works completely in-browser with reactive caching and zero external database dependencies needed for standalone deployments.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   cd YOUR_REPOSITORY_NAME
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled static files will be placed in the `dist/` directory.

---

## 🌐 Deployment Options

### 1. Vercel / Netlify (Recommended for Quick Sharing)
- Push this repo to GitHub.
- Import the repo into [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
- Build command: `npm run build`
- Output directory: `dist`

### 2. GitHub Pages
1. Install `gh-pages` if desired:
   ```bash
   npm install -D gh-pages
   ```
2. Add `"deploy": "vite build && gh-pages -d dist"` to `package.json` scripts.
3. Configure `base: '/<REPO_NAME>/'` in `vite.config.ts`.
4. Run `npm run deploy`.

---

## 📋 Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion
- **Data Parsing & Export**: PapaParse, XLSX, Canvas Confetti

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
