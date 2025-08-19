// FILE: src/lib/csvParser.ts
// CSV parser with strict validation per PRD - auto-detect delimiter, validate ranges
import type { TemperatureDataPoint, CSVValidationError, CSVParseResult } from '../types/csv';

const MAX_ROWS = 1000; // "hundreds of lines OK" per PRD
const TEMP_MIN = -100.0;
const TEMP_MAX = 1400.0;
const MAX_CHANNELS = 12;

export function parseCSV(content: string): CSVParseResult {
  const lines = content.trim().split('\n').filter(line => line.trim());
  
  // Check file size limit
  if (lines.length > MAX_ROWS) {
    return {
      data: [],
      error: { 
        type: 'tooLarge', 
        message: `File too large. Maximum supported rows: ${MAX_ROWS}` 
      }
    };
  }

  if (lines.length === 0) {
    return {
      data: [],
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
      error: { 
        type: 'delimiter', 
        message: 'Invalid delimiter, expected ; or ,' 
      }
    };
  }

  // Parse first line to detect header and validate column count
  const firstRowCols = firstLine.split(delimiter).map(col => col.trim());
  const expectedMinCols = 2; // time + at least 1 channel
  const expectedMaxCols = MAX_CHANNELS + 1; // time + up to 12 channels
  
  if (firstRowCols.length < expectedMinCols || firstRowCols.length > expectedMaxCols) {
    return {
      data: [],
      error: { 
        type: 'columnCount', 
        message: `Expected [time + up to ${MAX_CHANNELS} channels], found ${firstRowCols.length}` 
      }
    };
  }

  // Auto-detect header row (Italian: Tempo [s];CH1;CH2;... or similar)
  let startRow = 0;
  const firstCol = firstRowCols[0].toLowerCase();
  const hasHeader = isNaN(Number(firstRowCols[0])) || 
                   firstCol.includes('tempo') || 
                   firstCol.includes('time') ||
                   firstCol.includes('sec');
  
  if (hasHeader) {
    startRow = 1;
  }

  // Validate we have data rows
  if (startRow >= lines.length) {
    return {
      data: [],
      error: {
        type: 'invalidValue',
        message: 'No data rows found'
      }
    };
  }

  const data: TemperatureDataPoint[] = [];
  const expectedColCount = firstRowCols.length;
  
  for (let i = startRow; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    
    const cols = row.split(delimiter).map(col => col.trim());
    
    // Validate column count consistency
    if (cols.length !== expectedColCount) {
      return {
        data: [],
        error: { 
          type: 'columnCount',
          message: `Expected ${expectedColCount} columns, found ${cols.length}`,
          row: i + 1
        }
      };
    }

    // Parse time (first column)
    const timeStr = cols[0];
    const time = Number(timeStr);
    if (isNaN(time) || time < 0) {
      return {
        data: [],
        error: { 
          type: 'invalidValue',
          message: `Invalid time value in row ${i + 1}, column 1`,
          row: i + 1,
          column: 1
        }
      };
    }

    // Parse temperature channels (remaining columns)
    for (let j = 1; j < cols.length; j++) {
      const tempStr = cols[j];
      if (!tempStr || tempStr === '') continue; // Skip empty values
      
      const temp = Number(tempStr);
      if (isNaN(temp)) {
        return {
          data: [],
          error: { 
            type: 'invalidValue',
            message: `Invalid temperature value in row ${i + 1}, column ${j + 1}`,
            row: i + 1,
            column: j + 1
          }
        };
      }

      // Filter temperatures outside valid range [-100.0, 1400.0]
      if (temp >= TEMP_MIN && temp <= TEMP_MAX) {
        data.push({
          time: Math.round(time), // seconds only, no milliseconds
          temperature: Math.round(temp * 10) / 10, // truncate to 1 decimal
          channel: j // channels 1-12
        });
      }
    }
  }

  return { data };
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