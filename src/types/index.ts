// FILE: src/types/index.ts
// Core types for temperature chart app - exactly 12 channels max

export interface TemperatureDataPoint {
  time: number; // seconds
  temperature: number; // °C, truncated to 1 decimal
  channel: number; // 1-12
}

export interface ChannelConfig {
  id: number; // 1-12
  label: string; // CH1, CH2, etc.
  visible: boolean;
  color: string; // hex color
}

export interface ChartDisplayMode {
  type: 'scatter' | 'line' | 'both';
}