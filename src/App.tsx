import { useState, useEffect, useRef } from 'react';
import { parseCSV } from './lib/csvParser';
import type { TemperatureDataPoint, CSVValidationError, TimeMapping } from './types/csv';
import type { ChartDisplayMode } from './types';
import ChartArea from './components/ChartArea';

interface Channel {
  id: number;
  label: string;
  visible: boolean;
  color: string;
  dataCount: number;
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3',
  '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43', '#EE5A24', '#0ABDE3'
];

function App() {
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<TemperatureDataPoint[]>([]);
  const [timeMapping, setTimeMapping] = useState<TimeMapping[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [error, setError] = useState<CSVValidationError | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [chartMode, setChartMode] = useState<ChartDisplayMode>({ type: 'both' });
  const [jumpToTime, setJumpToTime] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<any>(null);

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);


  // Generate channels from data
  useEffect(() => {
    if (data.length > 0) {
      const channelData = new Map<number, number>();
      data.forEach(point => {
        channelData.set(point.channel, (channelData.get(point.channel) || 0) + 1);
      });

      const newChannels: Channel[] = [];
      for (let i = 1; i <= 12; i++) {
        const dataCount = channelData.get(i) || 0;
        newChannels.push({
          id: i,
          label: `CH${i}`,
          visible: dataCount > 0,
          color: DEFAULT_COLORS[i - 1] || '#666666',
          dataCount
        });
      }
      setChannels(newChannels);
    } else {
      setChannels([]);
    }
  }, [data]);

  const handleCSVContent = (content: string, filename: string) => {
    const result = parseCSV(content);
    
    if (result.error) {
      setError(result.error);
      setData([]);
      setTimeMapping([]);
      setCurrentFile('');
    } else {
      setData(result.data);
      setTimeMapping(result.timeMapping);
      setCurrentFile(filename);
      setError(null);
    }
  };

  const handleFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleCSVContent(content, file.name);
      };
      reader.readAsText(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'));
    
    if (csvFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleCSVContent(content, csvFile.name);
      };
      reader.readAsText(csvFile);
    }
  };

  const toggleChannel = (channelId: number) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, visible: !ch.visible } : ch
    ));
  };

  const changeChannelColor = (channelId: number, color: string) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, color } : ch
    ));
  };

  const calculateStats = (channelId: number) => {
    const channelData = data.filter(d => d.channel === channelId);
    if (channelData.length === 0) return { min: 0, max: 0, avg: 0 };
    
    const temps = channelData.map(d => d.temperature);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const avg = temps.reduce((sum, t) => sum + t, 0) / temps.length;
    
    return {
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      avg: Math.round(avg * 10) / 10
    };
  };

  // Convert Channel[] to ChannelConfig[] for chart component
  const chartChannels = channels.map(ch => ({
    id: ch.id,
    label: ch.label,
    visible: ch.visible,
    color: ch.color
  }));

  const handleResetZoom = () => {
    chartRef.current?.getEchartsInstance()?.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100
    });
  };

  const handleChartModeChange = (mode: string) => {
    setChartMode({ type: mode as 'scatter' | 'line' | 'both' });
  };

  const handleExport = (format: 'png' | 'jpg' = 'png') => {
    if (!chartRef.current) return;

    const chartInstance = chartRef.current.getEchartsInstance();
    if (chartInstance) {
      try {
        const dataURL = chartInstance.getDataURL({
          type: format,
          pixelRatio: 2,
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF'
        });

        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `temperature-chart-${timestamp}.${format}`;
        link.href = dataURL;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Export error:', error);
      }
    }
  };

  const handleExportCSV = () => {
    if (!data.length || !timeMapping.length) return;

    // Create CSV content with visible channels only
    const visibleChannels = chartChannels.filter(ch => ch.visible);
    const headers = ['Time', ...visibleChannels.map(ch => ch.label)];
    
    const csvRows = [headers.join(',')];
    
    // Group data by time index
    const dataByTime = new Map();
    data.forEach(point => {
      if (!dataByTime.has(point.time)) {
        dataByTime.set(point.time, {});
      }
      dataByTime.get(point.time)[point.channel] = point.temperature;
    });

    // Generate CSV rows
    timeMapping.forEach(tm => {
      if (dataByTime.has(tm.index)) {
        const timeData = dataByTime.get(tm.index);
        const row = [tm.displayTime];
        visibleChannels.forEach(ch => {
          row.push(timeData[ch.id] || '');
        });
        csvRows.push(row.join(','));
      }
    });

    // Download CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `temperature-data-${timestamp}.csv`;
    link.href = url;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSaveSession = () => {
    if (!data.length) return;

    // Get current zoom state from chart
    let zoomState = null;
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      if (chartInstance) {
        const option = chartInstance.getOption();
        zoomState = option.dataZoom;
      }
    }

    // Create session data
    const sessionData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      filename: currentFile,
      data: data,
      timeMapping: timeMapping,
      channels: channels,
      chartMode: chartMode,
      isDark: isDark,
      zoomState: zoomState
    };

    // Download session file
    const sessionContent = JSON.stringify(sessionData, null, 2);
    const blob = new Blob([sessionContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    const baseName = currentFile.replace('.csv', '') || 'temperature-session';
    link.download = `${baseName}-${timestamp}.tdproj`;
    link.href = url;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLoadSession = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tdproj';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const sessionData = JSON.parse(e.target?.result as string);
            
            // Validate session data
            if (!sessionData.data || !sessionData.timeMapping || !sessionData.channels) {
              throw new Error('Invalid session file format');
            }

            // Restore session state
            setData(sessionData.data);
            setTimeMapping(sessionData.timeMapping);
            setChannels(sessionData.channels);
            setCurrentFile(sessionData.filename || 'Restored Session');
            setChartMode(sessionData.chartMode || { type: 'both' });
            setIsDark(sessionData.isDark || false);
            setError(null);

            // Restore zoom state after chart renders
            if (sessionData.zoomState && chartRef.current) {
              setTimeout(() => {
                const chartInstance = chartRef.current?.getEchartsInstance();
                if (chartInstance && sessionData.zoomState) {
                  chartInstance.setOption({ dataZoom: sessionData.zoomState });
                }
              }, 100);
            }
          } catch (error) {
            setError({
              type: 'invalidValue',
              message: 'Failed to load session file. Please check the file format.'
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleJumpToTime = () => {
    if (!jumpToTime || !chartRef.current || timeMapping.length === 0) return;

    // Find the closest time index based on user input
    let targetIndex = -1;
    
    // Check if input looks like time format (HH:MM or H:MM)
    if (jumpToTime.includes(':')) {
      const mapping = timeMapping.find(tm => tm.displayTime === jumpToTime);
      if (mapping) {
        targetIndex = mapping.index;
      }
    } else {
      // Treat as time like "11:05" if user enters "1105" or similar
      const timeNum = parseInt(jumpToTime);
      if (timeNum >= 0 && timeNum <= 2359) {
        const hours = Math.floor(timeNum / 100);
        const minutes = timeNum % 100;
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const mapping = timeMapping.find(tm => tm.displayTime === timeStr);
        if (mapping) {
          targetIndex = mapping.index;
        }
      }
    }

    // If exact match not found, find closest time
    if (targetIndex === -1 && jumpToTime.includes(':')) {
      const [inputHours, inputMinutes] = jumpToTime.split(':').map(s => parseInt(s));
      if (!isNaN(inputHours) && !isNaN(inputMinutes)) {
        const inputTotalMinutes = inputHours * 60 + inputMinutes;
        let closestDistance = Infinity;
        
        timeMapping.forEach(tm => {
          const [hours, minutes] = tm.displayTime.split(':').map(s => parseInt(s));
          const totalMinutes = hours * 60 + minutes;
          const distance = Math.abs(totalMinutes - inputTotalMinutes);
          if (distance < closestDistance) {
            closestDistance = distance;
            targetIndex = tm.index;
          }
        });
      }
    }

    // Navigate to the target time
    if (targetIndex !== -1) {
      const chartInstance = chartRef.current?.getEchartsInstance();
      if (chartInstance) {
        // Center the view around target time with some context
        const contextRange = Math.max(5, Math.round((timeMapping.length - 1) * 0.1));
        const startIndex = Math.max(0, targetIndex - contextRange);
        const endIndex = Math.min(timeMapping.length - 1, targetIndex + contextRange);
        
        chartInstance.dispatchAction({
          type: 'dataZoom',
          start: (startIndex / (timeMapping.length - 1)) * 100,
          end: (endIndex / (timeMapping.length - 1)) * 100
        });
      }
    }
  };

  const activeChannels = channels.filter(ch => ch.dataCount > 0);

  return (
    <div className={`h-screen flex flex-col text-gray-900 dark:text-white transition-colors ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Bar */}
      <header className={`h-12 px-4 border-b flex items-center gap-3 flex-shrink-0 animate-slide-up ${isDark ? 'glass-panel-dark' : 'glass-panel'}`}>
        <button 
          onClick={handleFileInput}
          className="btn-glass hover-lift"
        >
          Import CSV
        </button>
        <button 
          disabled={!currentFile}
          onClick={() => handleExport('png')}
          className="btn-glass hover-lift"
        >
          Export PNG
        </button>
        <button 
          disabled={!currentFile}
          onClick={handleSaveSession}
          className="btn-glass hover-lift"
        >
          Save Session
        </button>
        <button 
          onClick={handleLoadSession}
          className="btn-glass hover-lift"
        >
          Load Session
        </button>
        
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {currentFile ? `📄 ${currentFile}` : 'No file loaded'}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`w-72 border-r p-4 overflow-y-auto flex-shrink-0 animate-slide-up ${isDark ? 'glass-panel-dark' : 'glass-panel'}`}>
          <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Channels ({activeChannels.length}/12)
          </h3>
          
          {activeChannels.length > 0 ? (
            activeChannels.map((channel) => {
              const stats = calculateStats(channel.id);
              return (
                <div key={channel.id} className={`flex items-center gap-3 p-3 rounded-lg mb-3 transition-all duration-200 hover-lift animate-fade-in ${isDark ? 'glass-dark' : 'glass'}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4" 
                    checked={channel.visible}
                    onChange={() => toggleChannel(channel.id)}
                  />
                  <input 
                    type="color" 
                    className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    value={channel.color}
                    onChange={(e) => changeChannelColor(channel.id, e.target.value)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {channel.label} ({channel.dataCount} points)
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Min: {stats.min}°C | Max: {stats.max}°C | Avg: {stats.avg}°C
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              Import CSV to see channel data
            </div>
          )}
        </aside>

        {/* Chart Area */}
        <main 
          className="flex-1 relative animate-fade-in"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {data.length > 0 ? (
            <ChartArea
              ref={chartRef}
              data={data}
              channels={chartChannels}
              displayMode={chartMode}
              isDark={isDark}
              timeMapping={timeMapping}
            />
          ) : (
            <div className={`h-full m-4 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
              dragActive 
                ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">📊</div>
                <div className="text-lg font-medium mb-2">Temperature Chart</div>
                <div className="text-sm">Import a CSV file to display temperature data</div>
                <div className="text-xs mt-2 opacity-75">
                  {dragActive ? 'Drop CSV file here' : 'Drag & drop CSV files here or click Import'}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Bar */}
      <footer className={`h-11 px-4 border-t flex items-center gap-3 flex-shrink-0 animate-slide-up ${isDark ? 'glass-panel-dark' : 'glass-panel'}`}>
        <button 
          disabled={!data.length}
          onClick={handleResetZoom}
          className="btn-glass text-xs px-2 py-1 hover-lift"
        >
          Reset Zoom
        </button>
        
        <select 
          disabled={!data.length}
          value={chartMode.type === 'both' ? 'both' : chartMode.type}
          onChange={(e) => handleChartModeChange(e.target.value)}
          className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 backdrop-blur-sm disabled:opacity-50 ${isDark ? 'glass-dark' : 'glass'}`}
        >
          <option value="both">Line + Scatter</option>
          <option value="line">Line Only</option>
          <option value="scatter">Scatter Only</option>
        </select>
        
        <button 
          onClick={() => setIsDark(!isDark)}
          className="btn-glass text-xs px-2 py-1 hover-lift"
        >
          {isDark ? '☀️ Light' : '🌙 Dark'} Mode
        </button>
        
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Jump to:</span>
          <input 
            type="text" 
            placeholder="11:05"
            disabled={!data.length}
            value={jumpToTime}
            onChange={(e) => setJumpToTime(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJumpToTime()}
            className={`w-16 px-2 py-1 text-xs rounded-lg transition-all duration-200 backdrop-blur-sm disabled:opacity-50 text-gray-900 dark:text-white ${isDark ? 'glass-dark' : 'glass'}`}
          />
          <button 
            disabled={!data.length || !jumpToTime}
            onClick={handleJumpToTime}
            className="btn-glass text-xs px-2 py-1 hover-lift"
          >
            Go
          </button>
        </div>
      </footer>

      {/* Error Dialog */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className={`p-6 rounded-xl max-w-md mx-4 animate-scale-in ${isDark ? 'glass-panel-dark' : 'glass-panel'}`}>
            <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
              CSV Import Error
            </h3>
            <p className="text-sm mb-4 text-gray-700 dark:text-gray-300">
              {error.message}
            </p>
            {error.row && error.column && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Row {error.row}, Column {error.column}
              </p>
            )}
            <button 
              onClick={() => setError(null)}
              className="btn-glass w-full px-4 py-2 hover-lift"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;