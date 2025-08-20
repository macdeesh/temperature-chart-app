import { useState, useEffect, useRef } from 'react';
import { parseCSV } from './lib/csvParser';
import type { TemperatureDataPoint, CSVValidationError } from './types/csv';

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
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [error, setError] = useState<CSVValidationError | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setCurrentFile('');
    } else {
      setData(result.data);
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

  const activeChannels = channels.filter(ch => ch.dataCount > 0);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Bar */}
      <header className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 flex-shrink-0">
        <button 
          onClick={handleFileInput}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Import CSV
        </button>
        <button 
          disabled={!currentFile}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export
        </button>
        <button 
          disabled={!currentFile}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Session
        </button>
        <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          Load Session
        </button>
        
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {currentFile ? `📄 ${currentFile}` : 'No file loaded'}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto flex-shrink-0">
          <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Channels ({activeChannels.length}/12)
          </h3>
          
          {activeChannels.length > 0 ? (
            activeChannels.map((channel) => {
              const stats = calculateStats(channel.id);
              return (
                <div key={channel.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 mb-2">
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
          className="flex-1 p-4 bg-white dark:bg-gray-900"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={`h-full border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
            dragActive 
              ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600'
          }`}>
            <div className="text-center text-gray-500 dark:text-gray-400">
              {data.length > 0 ? (
                <>
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-lg font-medium mb-2">
                    Temperature Chart ({data.length} data points)
                  </div>
                  <div className="text-sm">
                    {activeChannels.filter(ch => ch.visible).length} channels visible
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-lg font-medium mb-2">Temperature Chart</div>
                  <div className="text-sm">Import a CSV file to display temperature data</div>
                  <div className="text-xs mt-2 opacity-75">
                    {dragActive ? 'Drop CSV file here' : 'Drag & drop CSV files here or click Import'}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Bar */}
      <footer className="h-11 px-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3 flex-shrink-0">
        <button 
          disabled={!data.length}
          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset Zoom
        </button>
        
        <select 
          disabled={!data.length}
          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option>Line + Scatter</option>
          <option>Line Only</option>
          <option>Scatter Only</option>
        </select>
        
        <button 
          onClick={() => setIsDark(!isDark)}
          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isDark ? '☀️ Light' : '🌙 Dark'} Mode
        </button>
        
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Jump to:</span>
          <input 
            type="number" 
            placeholder="Time (s)"
            disabled={!data.length}
            className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
          />
          <button 
            disabled={!data.length}
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Go
          </button>
        </div>
      </footer>

      {/* Error Dialog */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4 shadow-xl">
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
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
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