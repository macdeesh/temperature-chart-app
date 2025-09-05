# VizTherm - Professional Temperature Chart Application

VizTherm is a professional desktop temperature visualization tool built with Tauri, React, and TypeScript. It provides engineering-grade temperature charting with precise data analysis capabilities and a secure demo license system.

## ✨ Key Features

### Core Functionality
- **Multi-channel temperature visualization** (up to 12 channels)
- **Professional engineering charts** with minor/major grid lines  
- **Smart chart scaling** with logical temperature intervals
- **Interactive zoom and pan** with 60fps performance
- **Dual view modes** - Chart visualization and raw data table
- **Dark/Light theme** with professional glass-morphism styling

### Professional Tools
- **PDF Export** with high-resolution charts and company logos
- **Session Management** (.tdproj files) for saving work
- **Channel Renaming** with session persistence
- **Large dataset support** (up to 5000 data points)

### Demo License System
- **Secure offline licensing** with AES-GCM encryption
- **Flexible trial periods** (7-14 days for production, minutes/hours for testing)
- **Professional license UI** matching app design
- **Action-based validation** (no performance impact)
- **Runtime expiration detection** with seamless user experience

## 🛠 Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Desktop**: Tauri v2 (Rust backend)
- **Charts**: ECharts with custom professional styling
- **Styling**: TailwindCSS with glass morphism design
- **PDF Generation**: jsPDF for professional report exports

## 📦 Installation & Development

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Tauri CLI

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run tauri dev

# Build for production
npm run tauri build
```

### Development Commands

- `npm run dev` - Frontend development server
- `npm run build` - Production build
- `npm run tauri dev` - Full Tauri development mode
- `npm run tauri build` - Create desktop application

## 📊 CSV Data Format

VizTherm accepts CSV files with the following format:

```csv
time,temperature,channel
600,25.5,1
610,26.2,1
620,27.1,2
```

- **time**: Time in seconds from start
- **temperature**: Temperature value in Celsius
- **channel**: Channel number (1-12)

### Supported Features

- Up to 5000 data rows
- Automatic time reconstruction for missing seconds
- Gap detection and visualization
- Multiple channel data in single file

## 🎯 Version 1.1 - Professional Engineering Edition

### ✅ Completed Features

- [x] Smart chart scaling with logical intervals
- [x] Professional minor/major grid system
- [x] Company logo functionality
- [x] PDF export with professional layout
- [x] Channel renaming with persistence
- [x] Enhanced error handling and loading states
- [x] Engineering-style tick marks and spacing
- [x] Trend indicators in hover tooltips
- [x] Increased file size support (5000 rows)

### Performance

- **60fps** chart interactions
- **Smooth zooming** with large datasets
- **Responsive UI** during file operations
- **Memory efficient** data handling
- **Optimized rendering** with React.memo and useCallback
- **Memoized calculations** for chart generation

## 🏗 Architecture

### Frontend Structure

```text
src/
├── components/          # React components
│   ├── ChartArea.tsx   # Main chart component
│   ├── DataTableView.tsx # Raw data table view
│   ├── ViewToggle.tsx  # Chart/table toggle
│   └── UserGuideModal.tsx # Help system
├── lib/                # Core utilities and logic
│   ├── chartConfig.ts  # ECharts configuration
│   ├── csvParser.ts    # CSV file processing
│   ├── chartScaling.ts # Smart scaling logic
│   └── timeReconstruction.ts # Time axis handling
├── utils/              # Utility functions
│   └── trendUtils.ts   # Trend analysis utilities
├── types/              # TypeScript definitions
│   ├── index.ts        # Core types
│   └── csv.ts          # CSV-specific types
└── App.tsx            # Main application
```

### Key Components

- **ChartArea**: ReactECharts wrapper with professional styling
- **CSV Parser**: Robust file handling with validation
- **Chart Scaling**: Smart interval calculation for professional charts
- **Time Reconstruction**: Handles CSV data gaps and timing issues

## 🎨 Professional Design

VizTherm features a modern glass morphism design with:

- **Professional color scheme** (blues and teals)
- **Engineering-grade charts** with precise grid lines
- **Responsive layouts** with proper spacing
- **Theme consistency** across dark/light modes
- **Accessibility** with proper contrast ratios

## 📈 Use Cases

- **Engineering temperature monitoring**
- **Industrial process visualization**
- **Research data analysis**
- **Quality control reporting**
- **Professional documentation**
- **Multi-sensor temperature logging**

## 🔧 Configuration

The application can be configured through:

- **Session files** (.tdproj) for persistent settings
- **Logo customization** for company branding
- **Channel naming** for specific sensor identification
- **Export preferences** for professional reporting

## 📝 License

This project is part of the VizTherm temperature visualization suite.

## 🤝 Development

Built with precision and attention to engineering requirements. The application maintains 60fps performance while providing professional-grade temperature visualization capabilities suitable for industrial and research applications.

---

**VizTherm v1.1** - Professional Temperature Visualization Made Simple
