// FILE: src/components/CSVTest.tsx
// Test component for CSV parser functionality
import { useState } from 'react';
import { parseCSV } from '../lib/csvParser';
import type { CSVParseResult } from '../types/csv';

export default function CSVTest() {
  const [result, setResult] = useState<CSVParseResult | null>(null);

  // Sample CSV data for testing
  const sampleCSVs = {
    valid: `Tempo [s];CH1;CH2;CH3
0;25.5;30.2;-50.0
1;26.1;29.8;-45.5
2;25.8;30.5;-48.2`,
    
    invalidDelimiter: `Time,CH1,CH2
0 25.5 30.2
1 26.1 29.8`,
    
    outOfRange: `0;-200.0;25.0;1500.0
1;26.0;30.0;25.5`,
    
    tooManyColumns: `0;1;2;3;4;5;6;7;8;9;10;11;12;13;14
1;1;2;3;4;5;6;7;8;9;10;11;12;13;14`,
    
    invalidValue: `0;25.5;invalid;30.0
1;26.0;29.8;25.5`
  };

  const testCSV = (name: string, csv: string) => {
    const parseResult = parseCSV(csv);
    setResult({ ...parseResult, testName: name } as any);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">CSV Parser Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(sampleCSVs).map(([name, csv]) => (
          <button
            key={name}
            onClick={() => testCSV(name, csv)}
            className="p-3 border border-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium capitalize">{name.replace(/([A-Z])/g, ' $1')}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Test {name} CSV
            </div>
          </button>
        ))}
      </div>

      {result && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <h3 className="font-medium mb-2">
            Test Result: {(result as any).testName}
          </h3>
          
          {result.error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
              <div className="font-medium text-red-800 dark:text-red-200">
                Error: {result.error.type}
              </div>
              <div className="text-red-700 dark:text-red-300 mt-1">
                {result.error.message}
              </div>
              {result.error.row && result.error.column && (
                <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Row {result.error.row}, Column {result.error.column}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
              <div className="font-medium text-green-800 dark:text-green-200">
                Success! Parsed {result.data.length} data points
              </div>
              <div className="mt-2 text-sm">
                <div className="font-medium mb-1">Sample data:</div>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result.data.slice(0, 3), null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}