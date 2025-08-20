// FILE: src/lib/csvParser.ts
// Enhanced CSV parser for real-world datetime format with time mapping
import type { TemperatureDataPoint, CSVValidationError, CSVParseResult, TimeMapping } from '../types/csv';

const MAX_ROWS = 1000; // "hundreds of lines OK" per PRD
const TEMP_MIN = -100.0;
const TEMP_MAX = 1400.0;
const MAX_CHANNELS = 12;

// Parse datetime formats like "15/07/2021 10:38" and extract time
function parseDateTime(dateTimeStr: string): string | null {
  try {
    // Handle formats like "15/07/2021 10:38" or "15/07/2021 10:38:00"
    const parts = dateTimeStr.trim().split(' ');
    if (parts.length < 2) return null;
    
    const timePart = parts[1]; // "10:38" or "10:38:00"
    const timeComponents = timePart.split(':');
    
    if (timeComponents.length >= 2) {
      const hours = timeComponents[0].padStart(2, '0');
      const minutes = timeComponents[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Check if a string represents a valid temperature number
function isValidTemperature(value: string): boolean {
  if (!value || value.trim() === '') return false;
  const num = Number(value.trim());
  return !isNaN(num) && num >= TEMP_MIN && num <= TEMP_MAX;
}

export function parseCSV(content: string): CSVParseResult {
  const lines = content.trim().split('\n').filter(line => line.trim());
  
  // Check file size limit
  if (lines.length > MAX_ROWS) {
    return {
      data: [],
      timeMapping: [],
      error: { 
        type: 'tooLarge', 
        message: `File too large. Maximum supported rows: ${MAX_ROWS}` 
      }
    };
  }

  if (lines.length === 0) {
    return {
      data: [],
      timeMapping: [],
      error: {
        type: 'invalidValue',
        message: 'Empty file'
      }
    };
  }

  // Auto-detect delimiter (prefer ; over ,)
  const firstLine = lines[0];
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  
  let delimiter: string;
  if (semicolonCount > 0 && semicolonCount >= commaCount) {
    delimiter = ';';
  } else if (commaCount > 0) {
    delimiter = ',';
  } else {
    return {
      data: [],
      timeMapping: [],
      error: { 
        type: 'delimiter', 
        message: 'Invalid delimiter, expected ; or ,' 
      }
    };
  }

  // Parse first line to validate basic structure
  const firstRowCols = firstLine.split(delimiter).map(col => col.trim());
  const expectedMinCols = 2; // datetime + at least 1 data column
  const expectedMaxCols = MAX_CHANNELS + 1; // datetime + up to 12 channels
  
  if (firstRowCols.length < expectedMinCols) {
    return {
      data: [],
      timeMapping: [],
      error: { 
        type: 'columnCount', 
        message: `Expected at least ${expectedMinCols} columns, found ${firstRowCols.length}` 
      }
    };
  }

  // Check if first column looks like datetime
  const firstColSample = firstRowCols[0];
  const parsedTime = parseDateTime(firstColSample);
  if (!parsedTime) {
    return {
      data: [],
      timeMapping: [],
      error: {
        type: 'dateFormat',
        message: 'First column must contain datetime format (e.g., "15/07/2021 10:38")'
      }
    };
  }

  const data: TemperatureDataPoint[] = [];
  const timeMapping: TimeMapping[] = [];
  const expectedColCount = firstRowCols.length;
  
  for (let i = 0; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    
    const cols = row.split(delimiter).map(col => col.trim());
    
    // Validate column count consistency
    if (cols.length !== expectedColCount) {
      return {
        data: [],
        timeMapping: [],
        error: { 
          type: 'columnCount',
          message: `Expected ${expectedColCount} columns, found ${cols.length}`,
          row: i + 1
        }
      };
    }

    // Parse datetime from first column
    const dateTimeStr = cols[0];
    const displayTime = parseDateTime(dateTimeStr);
    
    if (!displayTime) {
      return {
        data: [],
        timeMapping: [],
        error: { 
          type: 'dateFormat',
          message: `Invalid datetime format in row ${i + 1}, column 1`,
          row: i + 1,
          column: 1
        }
      };
    }

    // Add time mapping entry
    timeMapping.push({
      index: i,
      displayTime,
      originalTime: dateTimeStr
    });

    // Parse data columns (skip first datetime column)
    for (let j = 1; j < cols.length; j++) {
      const valueStr = cols[j];
      
      // Skip non-numeric columns (like "Sotto Scala")
      if (!isValidTemperature(valueStr)) {
        continue;
      }
      
      const temp = Number(valueStr.trim());
      
      // Add valid temperature data point
      data.push({
        time: i, // sequential index for chart
        temperature: Math.round(temp * 10) / 10, // truncate to 1 decimal
        channel: j // channel number (1-based from column position)
      });
    }
  }

  // Validate we found some temperature data
  if (data.length === 0) {
    return {
      data: [],
      timeMapping: [],
      error: {
        type: 'invalidValue',
        message: 'No valid temperature data found in file'
      }
    };
  }

  return { data, timeMapping };
}

// Utility function to get display time from mapping
export function getDisplayTime(timeIndex: number, timeMapping: TimeMapping[]): string {
  const mapping = timeMapping.find(tm => tm.index === timeIndex);
  return mapping ? mapping.displayTime : timeIndex.toString();
}

// Utility function to validate CSV format before parsing
export function validateCSVFormat(content: string): CSVValidationError | null {
  if (!content || content.trim().length === 0) {
    return { type: 'invalidValue', message: 'Empty file' };
  }

  const lines = content.trim().split('\n').filter(line => line.trim());
  
  if (lines.length > MAX_ROWS) {
    return { 
      type: 'tooLarge', 
      message: `File too large. Maximum supported rows: ${MAX_ROWS}` 
    };
  }

  return null;
}