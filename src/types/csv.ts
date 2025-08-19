// FILE: src/types/csv.ts
// CSV validation types per PRD requirements

export interface TemperatureDataPoint {
  time: number; // seconds only
  temperature: number; // °C, truncated to 1 decimal
  channel: number; // 1-12
}

export interface CSVValidationError {
  type: 'delimiter' | 'columnCount' | 'invalidValue' | 'tooLarge';
  message: string;
  row?: number;
  column?: number;
}

export interface CSVParseResult {
  data: TemperatureDataPoint[];
  error?: CSVValidationError;
}