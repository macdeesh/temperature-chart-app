# VizTherm Temperature Chart App - Project Context

## Project Overview

**VizTherm** is a production-ready desktop application for importing and visualizing real-world temperature CSV data with professional engineering chart capabilities. Built with Tauri (Rust backend) + React + TypeScript + ECharts.

## Current Status: PRODUCTION READY ✅

- **Version**: 1.1 COMPLETE - All roadmap objectives achieved and exceeded
- **Status**: Professional engineering-grade desktop application
- **Target Users**: Engineers analyzing temperature data from manufacturing/testing equipment

## Architecture Decisions

### Frontend Stack

- **React 19** + TypeScript + Vite for development speed
- **ECharts** for professional charting with native time axis support
- **TailwindCSS** for styling with custom glassmorphism design
- **Tauri** for cross-platform desktop deployment

### Key Architectural Choices Made

1. **Native ECharts Time Axis**: Replaced synthetic time rulers with proper ISO timestamps
2. **Gap-Filled Time Series**: Handle discontinuous CSV data with null values for line breaks
3. **Smart Time Reconstruction**: Analyze CSV patterns to reconstruct missing seconds from repeat counts
4. **Professional Scaling**: Temperature (50°→25°→10°→5°) and Time (10min→5min→2min→1min→30s→10s) intervals

### Data Flow Architecture

```text

CSV Import → Time Reconstruction → Gap-Filled Series → ECharts Native Time Axis
     ↓              ↓                    ↓                     ↓
csvParser.ts → timeReconstruction.ts → chartConfig.ts → ChartArea.tsx
```

## Development Status: V1.1 COMPLETE ✅

All V1.1 Roadmap Items Successfully Implemented

### Core Features Completed

1. ✅ **Time Axis Gap Handling** - CSV data with jumps (10:38→10:52) shows proper line breaks
2. ✅ **ECharts Native Time Axis** - Replaced synthetic rulers with ISO timestamps
3. ✅ **Seconds Reconstruction** - "10:54" repeated 6x → 10:54:00, 10:54:10, 10:54:20...
4. ✅ **Company Logo System** - Upload/display logos with sidebar management and chart watermarking
5. ✅ **PDF Export** - Professional PDF generation with jsPDF, logo integration, high-resolution charts
6. ✅ **Channel Renaming** - Custom channel labels with full session persistence
7. ✅ **Professional Engineering Grid Lines** - Minor/major grid system with 5°C precision
8. ✅ **Enhanced Tick Marks** - Engineering-style ticks on both axes with proper spacing

### Advanced Features (Beyond Original Roadmap)

1. ✅ **Smart Zoom Preservation** - Eliminated flicker during UI updates with partial chart updates
2. ✅ **Complete Keyboard Navigation** - Ctrl+arrows (pan), Ctrl+/- (zoom), Ctrl+0 (reset)
3. ✅ **Enhanced Mouse Navigation** - Shift+drag for temperature axis, consistent modifier keys
4. ✅ **Session Persistence** - All customizations (names, colors, logo) save/load perfectly
5. ✅ **Trend Indicators** - Rising/falling/stable indicators in hover tooltips
6. ✅ **Professional Branding** - Complete rebrand to "VizTherm" with custom theming

## Key Dependencies

- **Tauri**: v2.7.0 (Desktop framework)
- **React**: v19 (Frontend framework)
- **ECharts**: Latest via echarts-for-react (Professional charting)
- **jsPDF**: v2.5.1 (Professional PDF generation)
- **TypeScript**: Strict mode for type safety
- **Vite**: v7.1.2 (Build tool)
- **TailwindCSS**: Custom styling with glassmorphism design

## Important Configuration Details

### File Structure

```text
src/
├── lib/
│   ├── csvParser.ts        # CSV parsing with datetime detection
│   ├── timeReconstruction.ts # Smart time series reconstruction
│   ├── chartConfig.ts      # ECharts configuration with native time axis
│   └── chartScaling.ts     # Professional temperature/time scaling logic
├── components/
│   └── ChartArea.tsx       # Main chart component with forwardRef
└── types/
    ├── csv.ts             # CSV and time reconstruction interfaces
    └── index.ts           # Core temperature data types
```

### Data Model

- **12 channels maximum** for temperature data
- **Temperature range**: -100°C to 1400°C (engineering equipment range)
- **File limit**: 5000 rows (increased from 1000 in V1.1)
- **Time precision**: Handles both HH:MM and HH:MM:SS formats

### Chart Configuration

- **Native time axis**: Uses ISO timestamps for proper time handling
- **Gap handling**: Null values for discontinuous data (>2min gaps)
- **Zoom limits**: 10-second minimum intervals, 2-minute buffer after last point
- **Professional scaling**: Clean intervals without decimal artifacts

## Current Status: V1.2 IN PROGRESS 🚀

- ✅ **V1.1 Production Ready**: All objectives exceeded, fully deployed
- ✅ **V1.2 Phase 1 Complete**: Chart/Spreadsheet toggle view implemented
- ⚠️ **V1.2 Phase 2 In Progress**: Loading states and smooth transitions
- ✅ **Professional Grade**: Engineering-quality charts with precision grid lines
- ✅ **Advanced Navigation**: Complete keyboard and enhanced mouse navigation
- ✅ **Raw Data Access**: Complete CSV data visibility for engineers

## Future Development Phases (Optional)

### Phase 2: Advanced Analytics (Future Enhancement)

1. **Multi-file Comparison** - Compare multiple CSV datasets side-by-side
2. **Statistical Analysis** - Automated trend detection, min/max/average calculations
3. **Data Filtering** - Time range selection, channel-specific filtering
4. **Export Formats** - Excel, SVG, PNG options in addition to PDF

### Phase 3: Enterprise Features (Future Enhancement)

1. **Report Generation** - Automated analysis reports with insights
2. **Cloud Integration** - Data storage and sharing capabilities
3. **Plugin System** - Extensible analysis modules
4. **Custom Themes** - User-defined color schemes and branding

## Testing Notes

- **Test File**: new-sample.csv (Italian datetime format, semicolon delimited)
- **Data Characteristics**: 25°C to 860°C range, 10:38 to 11:02 timespan with gaps
- **Expected Behavior**: Proper time gaps, 10-second intervals, 2-minute buffer
