// FILE: src/types/csv.ts
// CSV validation types per PRD requirements with time mapping support

// Re-export TemperatureDataPoint from main types to avoid duplication
export type { TemperatureDataPoint } from './index';
import type { TemperatureDataPoint } from './index';

export interface TimeMapping {
  index: number; // sequential index (0, 1, 2...)
  displayTime: string; // formatted time ("10:38", "10:39"...)
  originalTime: string; // original datetime string
}

export interface CSVValidationError {
  type: 'delimiter' | 'columnCount' | 'invalidValue' | 'tooLarge' | 'dateFormat';
  message: string;
  row?: number;
  column?: number;
}

export interface ReconstructedTimePoint {
  originalIndex: number;
  displayTime: string;
  actualTime: string;
  isoTimestamp: string; // ISO timestamp for ECharts time axis
  timeInSeconds: number;
  hasOriginalSeconds: boolean;
}

export interface CSVParseResult {
  data: TemperatureDataPoint[];
  timeMapping: TimeMapping[];
  reconstructedTime: ReconstructedTimePoint[];
  error?: CSVValidationError;
}