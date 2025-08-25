// FILE: src/components/DataTableView.tsx
// Raw CSV data table view showing ALL data including errors and invalid values

import { useMemo } from 'react';

interface DataTableViewProps {
  rawCSVData: string[][];
  isDark?: boolean;
}

const DataTableView: React.FC<DataTableViewProps> = ({
  rawCSVData,
  isDark = false
}) => {

  // Process raw CSV data
  const processedData = useMemo(() => {
    if (rawCSVData.length === 0) return { headers: [], rows: [] };
    
    // Create proper headers: Time, CH1, CH2, ..., CH12
    const firstRow = rawCSVData[0] || [];
    const channelCount = firstRow.length - 1; // Subtract 1 for time column
    
    const headers = ['Time'];
    for (let i = 1; i <= channelCount; i++) {
      headers.push(`CH${i}`);
    }
    
    // All rows are data rows (don't skip first row)
    const rows = rawCSVData;
    
    return { headers, rows };
  }, [rawCSVData]);

  // Detect if a cell contains an error or invalid value
  const getCellStyle = (value: string) => {
    const trimmed = value.trim();
    
    // Check for common error indicators
    if (trimmed.toLowerCase().includes('sotto scala') || 
        trimmed.toLowerCase().includes('error') ||
        trimmed === '' ||
        (isNaN(parseFloat(trimmed)) && trimmed !== '' && !trimmed.includes(':'))) {
      return {
        isError: true,
        className: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
      };
    }
    
    // Check if it's a time value
    if (trimmed.includes(':')) {
      return {
        isError: false,
        className: isDark ? 'text-blue-400 font-mono' : 'text-blue-600 font-mono'
      };
    }
    
    // Check if it's a number (temperature)
    if (!isNaN(parseFloat(trimmed)) && trimmed !== '') {
      return {
        isError: false,
        className: 'font-mono'
      };
    }
    
    return {
      isError: false,
      className: ''
    };
  };

  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const headerBg = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50';

  return (
    <div className="h-full flex flex-col p-6">
      {/* Table Header */}
      <div className="flex-shrink-0 mb-4">
        <h2 className={`text-lg font-semibold ${textColor} mb-2`}>
          Raw CSV Data View
        </h2>
      </div>

      {/* Simple scrollable table - let browser handle scrollbars naturally */}
      <div 
        className={`flex-1 overflow-auto border rounded-lg ${borderColor}`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${isDark ? '#6B7280' : '#9CA3AF'} ${isDark ? '#17202E' : 'transparent'}`
        }}
      >
        <style>{`
          .table-scroll {
            scrollbar-width: thin;
            scrollbar-color: ${isDark ? '#6B7280 #17202E' : '#9CA3AF transparent'};
          }
          
          .table-scroll::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          .table-scroll::-webkit-scrollbar-track {
            background-color: ${isDark ? '#17202E' : 'transparent'};
            border-radius: 0px;
          }
          
          .table-scroll::-webkit-scrollbar-thumb {
            background-color: ${isDark ? '#6B7280' : '#9CA3AF'};
            border-radius: 4px;
          }
          
          .table-scroll::-webkit-scrollbar-thumb:hover {
            background-color: ${isDark ? '#9CA3AF' : '#6B7280'};
          }
          
          .table-scroll::-webkit-scrollbar-corner {
            background-color: ${isDark ? '#17202E' : 'transparent'};
          }
        `}</style>
        <div className="table-scroll h-full overflow-auto"
             style={{
               scrollbarWidth: 'thin',
               scrollbarColor: `${isDark ? '#6B7280' : '#9CA3AF'} ${isDark ? '#17202E' : 'transparent'}`
             }}>
        <table 
          className="min-w-full divide-y divide-gray-300 dark:divide-gray-700"
          style={{ width: `${processedData.headers.length * 120}px` }}
        >
          {/* Table Header */}
          <thead className={`${headerBg} sticky top-0 z-10`}>
            <tr>
              {processedData.headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${textColor} uppercase tracking-wider whitespace-nowrap`}
                >
                  <span>
                    {header || `Column ${index + 1}`}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody 
            className={`divide-y ${borderColor}`}
            style={{ backgroundColor: isDark ? '#17202E' : '#FFFFFF' }}
          >
            {processedData.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${hoverBg} transition-colors`}
                style={{ 
                  backgroundColor: rowIndex % 2 === 0 
                    ? (isDark ? '#17202E' : '#FFFFFF')
                    : (isDark ? '#1E293B' : '#F9FAFB')
                }}
              >
                {processedData.headers.map((_, cellIndex) => {
                  const cellValue = row[cellIndex] || '';
                  const cellStyle = getCellStyle(cellValue);
                  
                  return (
                    <td
                      key={cellIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${textColor}`}
                    >
                      <div className={`${cellStyle.className} ${
                        cellStyle.isError ? 'px-2 py-1 rounded text-xs' : ''
                      }`}>
                        {cellValue || (
                          <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'} italic`}>
                            (empty)
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default DataTableView;