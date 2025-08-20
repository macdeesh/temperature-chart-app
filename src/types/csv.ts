// FILE: src/types/csv.ts
// CSV validation types per PRD requirements with time mapping support

export interface TemperatureDataPoint {
  time: number; // sequential index (0, 1, 2, 3...)
  temperature: number; // °C, truncated to 1 decimal
  channel: number; // 1-12
}

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

export interface CSVParseResult {
  data: TemperatureDataPoint[];
  timeMapping: TimeMapping[];
  error?: CSVValidationError;
}