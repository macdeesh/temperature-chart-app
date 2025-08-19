# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React + Vite)
- `npm run dev` - Start development server (runs on port 1420)
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run preview` - Preview production build

### Tauri Desktop App
- `npm run tauri dev` - Start Tauri development mode (builds both frontend and backend)
- `npm run tauri build` - Build Tauri app for production
- `npm run tauri` - Access Tauri CLI commands

### Testing
- Uses Vitest for testing (configured in package.json)
- Run tests with standard Vitest commands

## Architecture

This is a Tauri desktop application that displays temperature charts using ECharts. The application has a hybrid React frontend + Rust backend architecture:

### Frontend Structure
- **React 19** with TypeScript using Vite as the build tool
- **TailwindCSS** for styling with custom color scheme (primary blues, accent teal)
- **ECharts integration** via `echarts-for-react` for charting functionality

### Key Components
- `src/App.tsx` - Main application with sample data and UI controls
- `src/components/ChartArea.tsx` - Chart component using ReactECharts with forwardRef pattern
- `src/lib/chartConfig.ts` - ECharts configuration logic with theming support
- `src/types/index.ts` - TypeScript definitions for temperature data and chart modes

### Data Model
- Supports exactly 12 temperature channels maximum
- Temperature data points include: time (seconds), temperature (°C), channel (1-12)
- Chart display modes: scatter, line, or both combined
- Y-axis range fixed at -100°C to 1400°C with 25° major intervals

### Tauri Backend
- Minimal Rust backend using Tauri v2
- Basic "greet" command example in `src-tauri/src/lib.rs`
- Standard Tauri configuration in `tauri.conf.json`
- Window size: 800x600px

### Styling Approach
- Uses inline styles in React components rather than CSS modules
- Dark/light theme support built into chart configuration
- TailwindCSS configured but primarily used for color definitions

## Key Features
- Real-time temperature charting with zoom/pan capabilities
- Multi-channel data visualization (up to 12 channels)
- Dark/light theme switching
- Responsive chart rendering with canvas backend
- Cross-platform desktop deployment via Tauri