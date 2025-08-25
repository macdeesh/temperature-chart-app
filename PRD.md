# PRD – Temperature Chart App (Updated)

## 1. Overview

A desktop app (Tauri + React + TypeScript + ECharts + Tailwind CSS) to import real-world temperature CSVs, visualize up to 12 channels over time with enhanced data analysis features, allow detailed inspection (tooltips, trends, filtering), and export results. Runs fully offline with modern glassmorphism UI.

## 2. Data Input

### 2.1 File Format

- **Supported formats**: CSV only
- **Delimiter**: Auto-detect `;` (preferred) or `,`
- **Decimal separator**: Always `.`
- **DateTime format**: Support real-world formats like `15/07/2021 10:38` (DD/MM/YYYY HH:MM)
- **Mixed columns**: Auto-detect and skip non-numeric columns (e.g., "Sotto Scala" text)
- **No header requirement**: Parse data rows directly, auto-generate channel labels

### 2.2 Enhanced Validation

- **Check delimiter, column count, datetime format, numeric values**
- **Specific error messages**:
  - Wrong delimiter → "Invalid delimiter, expected ; or ,"
  - Invalid datetime → "First column must contain datetime format (e.g., '15/07/2021 10:38')"
  - No valid data → "No valid temperature data found in file"
  - File too large → "File too large. Maximum supported rows: X"
- **File size limits**: Hundreds of lines OK, reject very large files with specific popup

### 2.3 Smart Data Processing

- **Temperature range**: [-100.0, 1400.0] °C (values outside range ignored)
- **Time conversion**: Convert datetime to display format (HH:MM) with sequential indexing internally
- **Precision**: 1 decimal place for temperatures, minutes for time display
- **Column detection**: Automatically identify temperature columns, skip text columns
- **Missing values**: Connected with line interpolation

## 3. Enhanced Chart Behavior

### 3.1 Chart Type & Display

- **Hybrid visualization**: Line + scatter (show both dots + connecting lines)
- **Display modes**: User toggle between line/scatter/both
- **Time mapping**: Sequential data (0,1,2...) mapped to display time (10:38, 10:39, 10:40...)
- **Smooth animations**: CSS transitions for all interactions

### 3.2 Advanced Axis Controls

- **X-axis**: Time display format (HH:MM) with smart labeling
- **Y-axis**: Temperature (°C) range -100 to 1400 with 25° major, 10° minor intervals
- **Auto-scale**: Fit dataset with zoom/pan (mouse wheel + drag)
- **Reset zoom**: Button to restore full view
- **Time navigation**: Jump to specific time input (e.g., "10:42")

### 3.3 Enhanced Tooltips & Interactions

- **Rich tooltips**: "CH1: 25.9°C at 10:38" with trend indicators
- **Temperature trends**: Show ↗️ rising, ↘️ falling, → stable indicators
- **Statistical highlights**: Mark unusual spikes/drops
- **Hover effects**: Smooth highlight with glassmorphism glow

### 3.4 Initial State

- Show entire dataset zoomed out with time range in header

## 4. Advanced Channel Management

### 4.1 Smart Channel Detection

- **Auto-generation**: CH1, CH2... based on detected temperature columns
- **Channel stats**: Min, max, avg temperature with trend indicators
- **Data point count**: Show number of valid readings per channel

### 4.2 Enhanced Channel Controls

- **Toggle visibility**: Individual channel show/hide with smooth animations
- **Advanced color picker**: Preset temperature-appropriate colors + custom picker
- **Channel filtering**: Quick show/hide multiple channels
- **Visual feedback**: Smooth color transitions

### 4.3 Channel Persistence

- Colors persist across sessions
- Visibility states saved in session files

## 5. Data Analysis Features

### 5.1 Temperature Trends

- **Trend indicators**: Visual arrows showing rising/falling patterns
- **Statistical alerts**: Highlight significant temperature changes
- **Trend analysis**: Show rate of change over time periods

### 5.2 Time-Based Filtering

- **Time range selection**: "Show only 10:30-11:00" functionality
- **Quick filters**: Last hour, specific time ranges
- **Filter persistence**: Remember user-selected time ranges

### 5.3 Statistical Analysis

- **Advanced stats**: Min, max, avg, standard deviation per channel
- **Anomaly detection**: Highlight unusual temperature spikes/drops
- **Data summaries**: Quick overview of temperature behavior

### 5.4 Data Export

- **Filtered data export**: Export currently visible data as CSV
- **Statistical reports**: Export analysis summaries

## 6. Professional Export & Save

### 6.1 Enhanced Chart Export

- **PNG/JPG**: Chart area only, high resolution with glassmorphism effects
- **PDF**: Single page, auto-scaled professional output
- **Report generation**: Automated summary reports with statistics

### 6.2 Advanced Session Management

- **Session files (.tdproj)**: Save complete app state
  - CSV file path and data
  - Channel colors and visibility
  - Zoom/viewport state
  - Time filter settings
  - Display preferences
- **Session templates**: Save/load different visualization presets
- **Auto-save**: Optional automatic session backup

## 7. Modern UI/UX with Glassmorphism

### 7.1 Enhanced Layout

- **Glassmorphism design**: Subtle transparency, backdrop blur, glass-like surfaces
- **Smooth animations**: All state changes with CSS transitions
- **Loading states**: Progress indicators for file operations
- **Responsive design**: Proper scaling and mobile-friendly fallbacks

### 7.2 Advanced Components

- **Top bar**: Import, Export, Save Session, Load Session with modern styling
- **Enhanced sidebar**:
  - Channel management with glassmorphism cards
  - Advanced color picker with presets
  - Real-time statistics with trend indicators
- **Chart area**:
  - Glassmorphism container with subtle shadows
  - Chart minimap for navigation overview
  - Annotation system for marking events
- **Bottom bar**:
  - Modern controls with glassmorphism styling
  - Enhanced time navigation
  - Display mode toggles

### 7.3 Theme System

- **Dark/Light mode**: Complete theme switching with persistence
- **Glassmorphism adaptation**: Different glass effects per theme
- **Smooth transitions**: Theme changes with animations

### 7.4 Advanced Interactions

- **Chart minimap**: Small overview chart for easy navigation
- **Annotation system**: Click to add markers for important events
- **Drag-and-drop**: Enhanced with visual feedback and animations
- **Time scrubbing**: Click and drag to navigate through time

## 8. Technical Performance

### 8.1 File Handling

- **Size limits**: Optimized for hundreds of rows, graceful degradation
- **Error handling**: Comprehensive validation with specific user-friendly messages
- **Memory management**: Efficient data structures for large datasets

### 8.2 Chart Performance

- **Smooth rendering**: 60fps animations and interactions
- **Efficient updates**: Optimized re-rendering for channel toggles
- **Responsive zoom**: Instant feedback for zoom/pan operations

## 9. Enhanced Features

### 9.1 Visual Polish

- **Modern glassmorphism**: Frosted glass effects throughout UI
- **Smooth animations**: All interactions with CSS transitions
- **Better color schemes**: Temperature-appropriate color palettes
- **Professional styling**: Clean, modern interface design

### 9.2 Advanced Navigation

- **Chart minimap**: Overview navigation for large datasets
- **Time scrubbing**: Intuitive time navigation
- **Keyboard accessibility**: Proper focus management and ARIA labels

### 9.3 Annotation System

- **Event markers**: Click to add annotations on timeline
- **Custom notes**: Add text descriptions for important events
- **Visual indicators**: Clear markers with hover details
- **Export annotations**: Include in reports and exports

## 10. Distribution & Deployment

- **macOS**: Universal binary with glassmorphism native styling
- **Windows**: Single EXE installer with modern Windows 11 styling
- **Auto-updates**: Not supported; manual installation for security
- **Offline operation**: Complete functionality without internet

## 11. Development Priorities

### 11.1 Phase 1 (Core)

1. Enhanced CSV parser with datetime support
2. ECharts integration with time mapping
3. Basic glassmorphism UI
4. Channel management with animations

### 11.2 Phase 2 (Analysis)

1. Temperature trends and statistical analysis
2. Time-based filtering
3. Advanced tooltips and interactions
4. Export functionality

### 11.3 Phase 3 (Polish)

1. Annotation system
2. Chart minimap
3. Report generation
4. Advanced glassmorphism effects

## 12. Success Criteria

- **Usability**: Import real-world CSV files without preprocessing
- **Performance**: Smooth 60fps interactions with hundreds of data points
- **Visual appeal**: Modern, professional interface with glassmorphism design
- **Functionality**: Complete temperature analysis workflow from import to export
- **Reliability**: Robust error handling and data validation
