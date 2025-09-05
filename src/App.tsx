import { useState, useEffect, useRef, useCallback } from 'react';
import { parseCSV } from './lib/csvParser';
import type { TemperatureDataPoint, CSVValidationError, TimeMapping, ReconstructedTimePoint } from './types/csv';
import type { ChartDisplayMode } from './types';
import type { LicenseStatus } from './types/license';
import ChartArea from './components/ChartArea';
import DataTableView from './components/DataTableView';
import ViewToggle from './components/ViewToggle';
import LoadingSpinner from './components/LoadingSpinner';
import UserGuideModal from './components/UserGuideModal';
import LicenseModal from './components/LicenseModal';
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, writeFile, readTextFile } from '@tauri-apps/plugin-fs';
import { listen } from '@tauri-apps/api/event';
import { calculateOptimalYAxisView } from './lib/chartScaling';
import { validateLicense } from './lib/licenseValidation';
import { getSavedLicense, clearLicense } from './lib/licenseStorage';
import jsPDF from 'jspdf';

interface Channel {
  id: number;
  label: string;
  customName?: string; // Custom user-defined name
  visible: boolean;
  color: string;
  dataCount: number;
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3',
  '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43', '#EE5A24', '#0ABDE3'
];

function App() {
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>({
    valid: false,
    daysRemaining: 0,
    showLicenseModal: false,
    error: '',
    keyId: null,
    loading: false,
  });
  
  const [isDark, setIsDark] = useState(true);
  const [data, setData] = useState<TemperatureDataPoint[]>([]);
  const [timeMapping, setTimeMapping] = useState<TimeMapping[]>([]);
  const [reconstructedTime, setReconstructedTime] = useState<ReconstructedTimePoint[]>([]);
  const [rawCSVData, setRawCSVData] = useState<string[][]>([]); // Store raw CSV rows for data table
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [error, setError] = useState<CSVValidationError | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [chartMode, setChartMode] = useState<ChartDisplayMode>({ type: 'both' });
  const [jumpToTime, setJumpToTime] = useState('');
  const [logoUrl, setLogoUrl] = useState<string>(''); // Custom logo URL
  const [clientName, setClientName] = useState<string>('VizTherm'); // Client name
  const [isLoadingSession, setIsLoadingSession] = useState(false); // Flag to track session loading
  const [currentView, setCurrentView] = useState<'chart' | 'table'>('chart'); // View toggle state
  const [isChartSettling, setIsChartSettling] = useState(false); // Flag for chart settling after view switch
  const [isLoadingCSV, setIsLoadingCSV] = useState(false); // Flag to track CSV processing
  const [isExportingPDF, setIsExportingPDF] = useState(false); // Flag for PDF export progress
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false); // Flag for user guide modal
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<any>(null);

  // Apply theme to html element and force style recalculation
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    // Remove any existing theme attributes
    html.removeAttribute('data-theme');
    body.className = '';
    
    // Force a repaint by accessing offsetHeight
    html.offsetHeight;
    
    // Apply new theme
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    body.className = isDark ? 'dark' : 'light';
    
    // Force another repaint to ensure styles are applied
    html.offsetHeight;
    
    // Force refresh of all elements with theme-dependent styles
    const themeElements = document.querySelectorAll('button, .glass, .glass-dark');
    themeElements.forEach(element => {
      // Force a style recalculation by briefly changing and reverting a property
      const originalDisplay = (element as HTMLElement).style.display;
      (element as HTMLElement).style.display = 'none';
      element.getBoundingClientRect(); // Force reflow
      (element as HTMLElement).style.display = originalDisplay;
    });
    
    // Trigger a custom event to notify components of theme change
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { isDark } 
    }));
  }, [isDark]);

  // License validation function - called on startup and user actions
  const checkLicense = useCallback(async () => {
    const savedLicense = getSavedLicense();
    if (!savedLicense) {
      setLicenseStatus({
        valid: false,
        daysRemaining: 0,
        showLicenseModal: true,
        error: 'No license found',
        keyId: null,
        loading: false,
      });
      return false;
    }

    try {
      const result = await validateLicense(savedLicense);
      
      if (result.valid) {
        setLicenseStatus({
          valid: true,
          daysRemaining: result.daysRemaining || 0,
          showLicenseModal: false,
          error: '',
          keyId: result.keyId || null,
          loading: false,
        });
        return true;
      } else {
        clearLicense();
        setLicenseStatus({
          valid: false,
          daysRemaining: 0,
          showLicenseModal: true,
          error: result.error || 'License validation failed',
          keyId: null,
          loading: false,
        });
        return false;
      }
    } catch (error) {
      clearLicense();
      setLicenseStatus({
        valid: false,
        daysRemaining: 0,
        showLicenseModal: true,
        error: 'License validation error',
        keyId: null,
        loading: false,
      });
      return false;
    }
  }, []);

  // Validate license on app startup only
  useEffect(() => {
    setLicenseStatus(prev => ({ ...prev, loading: true }));
    checkLicense();
  }, [checkLicense]);

  // Setup Tauri file drop event listener
  useEffect(() => {
    let unlistenDrop: (() => void) | undefined;
    
    const setupFileDropListener = async () => {
      try {
        // Use the working drag-drop event
        unlistenDrop = await listen('tauri://drag-drop', (event) => {
          const payload = event.payload as { paths: string[], position: { x: number, y: number } };
          const csvFile = payload.paths.find(file => file.toLowerCase().endsWith('.csv'));
          
          if (csvFile) {
            readTextFile(csvFile).then(async content => {
              const filename = csvFile.split('/').pop() || 'dropped-file.csv';
              await handleCSVContent(content, filename);
            }).catch(error => {
              console.error('Failed to read dropped file:', error);
              setError({
                type: 'invalidValue',
                message: 'Failed to read the dropped file.'
              });
            });
          }
        });
      } catch (error) {
        console.error('Failed to setup file drop listener:', error);
      }
    };
    
    setupFileDropListener();
    
    return () => {
      if (unlistenDrop) {
        unlistenDrop();
      }
    };
  }, []);


  // Generate channels from data (preserve existing customizations)
  useEffect(() => {
    if (isLoadingSession) {
      return; // Skip channel generation when loading session
    }
    
    if (data.length > 0) {
      const channelData = new Map<number, number>();
      data.forEach(point => {
        channelData.set(point.channel, (channelData.get(point.channel) || 0) + 1);
      });

      setChannels(prevChannels => {
        // If we have existing channels, preserve customizations
        if (prevChannels.length > 0) {
          return prevChannels.map(channel => ({
            ...channel,
            dataCount: channelData.get(channel.id) || 0,
            visible: (channelData.get(channel.id) || 0) > 0 ? channel.visible : false
          }));
        }
        
        // Otherwise create new default channels
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
        return newChannels;
      });
    } else {
      setChannels([]);
    }
  }, [data, isLoadingSession]);

  const handleLicenseValidated = (result: any) => {
    setLicenseStatus({
      valid: true,
      daysRemaining: result.daysRemaining || 0,
      showLicenseModal: false,
      error: '',
      keyId: result.keyId || null,
      loading: false,
    });
  };

  const handleRenewLicense = () => {
    setLicenseStatus(prev => ({
      ...prev,
      showLicenseModal: true,
      error: 'Enter new license key to extend trial'
    }));
  };

  const handleCSVContent = async (content: string, filename: string) => {
    setIsLoadingCSV(true);
    
    try {
      // Store raw CSV data for data table view
      const lines = content.trim().split('\n').filter(line => line.trim());
      const delimiter = (lines[0]?.match(/;/g) || []).length >= (lines[0]?.match(/,/g) || []).length ? ';' : ',';
      const rawRows = lines.map(line => line.split(delimiter));
      
      console.log('Raw CSV Debug:', {
        totalLines: lines.length,
        delimiter,
        firstRow: rawRows[0],
        totalRows: rawRows.length
      });
      
      setRawCSVData(rawRows);
      
      // Add small delay to show loading state for user feedback
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = parseCSV(content);
      
      if (result.error) {
        setError(result.error);
        setData([]);
        setTimeMapping([]);
        setReconstructedTime([]);
        setCurrentFile('');
      } else {
        setData(result.data);
        setTimeMapping(result.timeMapping);
        setReconstructedTime(result.reconstructedTime);
        setCurrentFile(filename);
        setError(null);
      }
    } finally {
      setIsLoadingCSV(false);
    }
  };

  const handleFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Check license before allowing file operations
    const isValid = await checkLicense();
    if (!isValid) return;

    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        await handleCSVContent(content, file.name);
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
    // Note: Tauri intercepts file drops, so this won't be called
    // Keeping for potential future browser compatibility
  };

  const toggleChannel = useCallback((channelId: number) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, visible: !ch.visible } : ch
    ));
  }, []);

  const changeChannelColor = useCallback((channelId: number, color: string) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, color } : ch
    ));
  }, []);

  const updateChannelName = useCallback((channelId: number, customName: string) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, customName: customName } : ch
    ));
  }, []);

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
    label: (ch.customName !== undefined && ch.customName !== '') ? ch.customName : ch.label, // Use custom name if available and not empty
    visible: ch.visible,
    color: ch.color
  }));

  const handleResetZoom = useCallback(() => {
    chartRef.current?.getEchartsInstance()?.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100
    });
  }, []);

  const handleChartModeChange = useCallback((mode: string) => {
    setChartMode({ type: mode as 'scatter' | 'line' | 'both' });
  }, []);


  const handleExportPDF = async () => {
    // Check license before allowing export operations
    const isValid = await checkLicense();
    if (!isValid) return;
    
    if (!chartRef.current) {
      setError({
        type: 'invalidValue',
        message: 'Chart not ready. Please try again.'
      });
      return;
    }

    const chartInstance = chartRef.current.getEchartsInstance();
    if (!chartInstance) {
      setError({
        type: 'invalidValue',
        message: 'Chart not loaded. Please try again.'
      });
      return;
    }

    setIsExportingPDF(true);

    try {
      // Wait a moment for chart to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get chart as high-resolution image
      const dataURL = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 3, // High resolution for PDF
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF'
      });

      if (!dataURL || dataURL === 'data:,') {
        throw new Error('Failed to generate chart image');
      }

      // Create PDF with professional layout
      const pdf = new jsPDF({
        orientation: 'landscape', // Better for charts
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions for professional layout
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const chartWidth = pageWidth - (margin * 2);
      const chartHeight = pageHeight - (margin * 2);

      // Add chart to PDF (logo already embedded in chart)
      pdf.addImage(dataURL, 'PNG', margin, margin, chartWidth, chartHeight);

      // Generate PDF as Uint8Array for Tauri
      const pdfOutput = pdf.output('arraybuffer');
      const pdfData = new Uint8Array(pdfOutput);

      // Create filename with proper timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
      const date = timestamp[0];
      const time = timestamp[1].split('-').slice(0, 2).join('-'); // HH-MM
      const baseName = currentFile.replace('.csv', '') || 'temperature-chart';
      const defaultName = `${baseName}-${date}_${time}.pdf`;
      
      const filePath = await save({
        defaultPath: defaultName,
        filters: [{
          name: 'PDF Document',
          extensions: ['pdf']
        }]
      });

      if (filePath) {
        // Write PDF file using Tauri's filesystem API
        await writeFile(filePath, pdfData);
      }
    } catch (error) {
      console.error('PDF export error:', error);
      setError({
        type: 'invalidValue',
        message: `Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSaveSession = async () => {
    // Check license before allowing save operations
    const isValid = await checkLicense();
    if (!isValid) return;
    
    if (!data.length) return;

    try {
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
        version: '1.1',
        timestamp: new Date().toISOString(),
        filename: currentFile,
        data: data,
        timeMapping: timeMapping,
        reconstructedTime: reconstructedTime,
        channels: channels,
        chartMode: chartMode,
        isDark: isDark,
        logoUrl: logoUrl,
        clientName: clientName,
        zoomState: zoomState
      };


      const timestamp = new Date().toISOString().split('T')[0];
      const baseName = currentFile.replace('.csv', '') || 'temperature-session';
      const defaultName = `${baseName}-${timestamp}.tdproj`;

      // Use Tauri's native save dialog
      const filePath = await save({
        defaultPath: defaultName,
        filters: [{
          name: 'Temperature Chart Project',
          extensions: ['tdproj']
        }]
      });

      if (filePath) {
        const sessionContent = JSON.stringify(sessionData, null, 2);
        await writeTextFile(filePath, sessionContent);
      }
    } catch (error) {
      console.error('Save session error:', error);
      setError({
        type: 'invalidValue',
        message: 'Failed to save session. Please try again.'
      });
    }
  };

  const handleLoadSession = async () => {
    try {
      // Use Tauri's native open dialog
      const filePath = await open({
        filters: [{
          name: 'Temperature Chart Project',
          extensions: ['tdproj']
        }]
      });

      if (filePath) {
        // Set loading flag to prevent channel regeneration
        setIsLoadingSession(true);
        
        // Read file using Tauri's filesystem API
        const sessionContent = await readTextFile(filePath);
        const sessionData = JSON.parse(sessionContent);
        
        // Validate session data
        if (!sessionData.data || !sessionData.timeMapping || !sessionData.channels) {
          throw new Error('Invalid session file format');
        }


        // Set non-data state first
        setTimeMapping(sessionData.timeMapping);
        setReconstructedTime(sessionData.reconstructedTime || []); // Handle legacy sessions
        setCurrentFile(sessionData.filename || 'Restored Session');
        setChartMode(sessionData.chartMode || { type: 'both' });
        setIsDark(sessionData.isDark || false);
        setLogoUrl(sessionData.logoUrl || '');
        setClientName(sessionData.clientName || 'VizTherm');
        setError(null);

        // Update loaded channels with current data counts
        const channelData = new Map<number, number>();
        sessionData.data.forEach((point: any) => {
          channelData.set(point.channel, (channelData.get(point.channel) || 0) + 1);
        });

        // Preserve custom names and settings but update data counts
        const updatedChannels = sessionData.channels.map((channel: any) => ({
          ...channel,
          dataCount: channelData.get(channel.id) || 0
        }));
        
        setChannels(updatedChannels);

        // Set data AFTER channels to prevent useEffect override
        setTimeout(() => {
          setData(sessionData.data);
          // Clear loading flag after data is set
          setTimeout(() => {
            setIsLoadingSession(false);
          }, 50);
        }, 50);

        // Restore zoom state after chart renders
        if (sessionData.zoomState) {
          // Wait longer for chart to fully render with new data
          setTimeout(() => {
            const chartInstance = chartRef.current?.getEchartsInstance();
            if (chartInstance && sessionData.zoomState) {
              chartInstance.setOption({ dataZoom: sessionData.zoomState });
              // Force chart update
              chartInstance.resize();
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error('Load session error:', error);
      setIsLoadingSession(false); // Clear loading flag on error
      setError({
        type: 'invalidValue',
        message: 'Failed to load session file. Please check the file format.'
      });
    }
  };

  const handleStartOver = () => {
    // Clear all data and reset to initial state
    setData([]);
    setTimeMapping([]);
    setReconstructedTime([]);
    setChannels([]);
    setCurrentFile('');
    setError(null);
    setJumpToTime('');
    setChartMode({ type: 'both' });
    setLogoUrl('');
    setClientName('VizTherm');
  };

  const handleLogoUpload = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setError({
          type: 'invalidValue',
          message: 'Invalid file type. Please upload PNG, JPG, or SVG files only.'
        });
        return;
      }

      // Convert to data URL for storage and display
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefaultLogo = () => {
    setLogoUrl('');
    setClientName('VizTherm');
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

    // Navigate to the target time with smart Y-axis positioning
    if (targetIndex !== -1) {
      const chartInstance = chartRef.current?.getEchartsInstance();
      if (chartInstance && reconstructedTime.length > 0) {
        // Find the corresponding reconstructed time point
        const targetTimePoint = reconstructedTime.find(rt => rt.originalIndex === targetIndex);
        
        if (targetTimePoint) {
          // Calculate optimal Y-axis view around the target time
          const contextRange = 10; // Show ±10 data points around target
          const yAxisView = calculateOptimalYAxisView(targetIndex, data, contextRange);
          
          // Get target timestamp and temperature range for context
          const targetTimestamp = new Date(targetTimePoint.isoTimestamp).getTime();
          
          // Get full temperature range from chart data for Y-axis context
          const allTemps = data.map(d => d.temperature);
          const fullTempMin = Math.min(...allTemps);
          const fullTempMax = Math.max(...allTemps);
          const fullTempRange = fullTempMax - fullTempMin;
          
          // Use direct timestamp-based centering for accurate positioning
          const contextTimeSpan = 4 * 60 * 1000; // 4 minutes context (2 min before + 2 min after target)
          const startTime = targetTimestamp - contextTimeSpan;
          const endTime = targetTimestamp + contextTimeSpan;
          
          
          // Use ECharts native time-based dataZoom for precise centering
          chartInstance.dispatchAction({
            type: 'dataZoom',
            dataZoomIndex: 0,
            startValue: startTime,
            endValue: endTime
          });
          
          // Also set temperature context
          chartInstance.dispatchAction({
            type: 'dataZoom', 
            dataZoomIndex: 1,
            start: Math.max(0, (((yAxisView.yMin + yAxisView.yMax) / 2 - fullTempMin) / fullTempRange) * 100 - 15),
            end: Math.min(100, (((yAxisView.yMin + yAxisView.yMax) / 2 - fullTempMin) / fullTempRange) * 100 + 15)
          });
          
          console.log('Jump to time:', {
            targetTime: targetTimePoint.displayTime,
            targetTimestamp,
            timeRange: [new Date(startTime).toISOString(), new Date(endTime).toISOString()],
            tempRange: [yAxisView.yMin, yAxisView.yMax]
          });
        }
      }
    }
  };

  const activeChannels = channels.filter(ch => ch.dataCount > 0);

  // Show loading screen during license validation
  if (licenseStatus.loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <LoadingSpinner
          size="large"
          text="Validating license..."
          isDark={true}
        />
      </div>
    );
  }

  // Show license modal on first startup if no license exists
  if (!licenseStatus.valid && !licenseStatus.keyId && licenseStatus.error === 'No license found') {
    return (
      <>
        <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <LicenseModal
          onLicenseValidated={handleLicenseValidated}
          initialError={licenseStatus.error}
        />
      </>
    );
  }

  return (
    <>
      {/* Global CSS to prevent elastic scrolling */}
      <style>{`
        html, body {
          overflow: hidden !important;
          overscroll-behavior: none !important;
          touch-action: pan-x pan-y !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
        #root {
          overflow: hidden !important;
          overscroll-behavior: none !important;
          width: 100% !important;
          height: 100% !important;
        }
        * {
          overscroll-behavior: contain !important;
        }
      `}</style>
      <div 
        className={`h-screen w-screen flex flex-col text-gray-900 dark:text-white transition-colors p-3 overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}
        style={{ 
          touchAction: 'pan-x pan-y',
          overscrollBehavior: 'none',
          WebkitOverflowScrolling: 'auto',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
        onChange={handleLogoChange}
        className="hidden"
      />

      {/* Main Container with Rounded Border */}
      <div className="flex-1 flex flex-col rounded-xl overflow-hidden">
        {/* Top Bar */}
        <header className={`h-16 px-6 py-3 border-t border-l border-r border-b flex items-center gap-4 flex-shrink-0 animate-slide-up rounded-t-xl glass-panel overflow-x-auto overflow-y-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <button 
          onClick={handleFileInput}
          className="btn-glass hover-lift px-4 py-2"
        >
          Import CSV
        </button>
        <button 
          disabled={!currentFile || isExportingPDF}
          onClick={handleExportPDF}
          className="btn-glass hover-lift px-4 py-2"
        >
          {isExportingPDF ? 'Exporting...' : 'Export PDF'}
        </button>
        <button 
          disabled={!currentFile}
          onClick={handleSaveSession}
          className="btn-glass hover-lift px-4 py-2"
        >
          Save Session
        </button>
        <button 
          onClick={handleLoadSession}
          className="btn-glass hover-lift px-4 py-2"
        >
          Load Session
        </button>
        
        {currentFile && (
          <button 
            onClick={handleStartOver}
            className="btn-glass hover-lift ml-2"
            title="Clear all data and start fresh"
          >
            Start Over
          </button>
        )}
        
        {/* View Toggle */}
        {currentFile && (
          <ViewToggle
            currentView={currentView}
            onViewChange={(view) => {
              if (view === 'chart' && currentView === 'table') {
                // Switching to chart view - trigger settling overlay
                setIsChartSettling(true);
                setCurrentView(view);
                setTimeout(() => {
                  setIsChartSettling(false);
                }, 300);
              } else {
                setCurrentView(view);
              }
            }}
            isDark={isDark}
          />
        )}
        
        <div className="ml-auto flex items-center space-x-4">
          
          <button 
            onClick={() => setIsUserGuideOpen(true)}
            className="btn-glass hover-lift px-3 py-2 text-sm"
            title="Open User Guide"
          >
            📖 Help
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
            {currentFile ? `📄 ${currentFile}` : 'No file loaded'}
          </div>
        </div>
      </header>

        {/* Main Content */}
        <div className={`flex flex-1 overflow-hidden border-l border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Left Sidebar */}
          <aside className={`w-80 border-r p-6 overflow-y-auto flex-shrink-0 animate-slide-up ${isDark ? 'bg-gray-900/20 backdrop-blur-20 border-gray-700' : 'bg-white/95 backdrop-blur-20 border-gray-200'}`}>
          
          {/* Logo Section - Minimalist */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              {/* Logo with dropdown */}
              <div className="relative group">
                <button
                  onClick={handleLogoUpload}
                  className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden bg-white/10 hover:bg-white/20 transition-all duration-200"
                  title="Click to change logo"
                >
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Company Logo" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img 
                      src="/app-icon.png" 
                      alt="Temperature Chart App" 
                      className="w-full h-full object-contain"
                    />
                  )}
                </button>
                {logoUrl && (
                  <button
                    onClick={resetToDefaultLogo}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Reset to default"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {/* Client name with inline edit */}
              <div className="flex-1">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full text-sm font-medium bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 hover:bg-white/5 focus:bg-white/10 rounded px-2 py-1 transition-all duration-200"
                  placeholder="VizTherm"
                  title="Click to edit client name"
                />
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Channels ({activeChannels.length}/12)
          </h3>
          
          {activeChannels.length > 0 ? (
            activeChannels.map((channel) => {
              const stats = calculateStats(channel.id);
              return (
                <div key={channel.id} className="p-3 rounded-xl mb-3 transition-all duration-200 hover-lift animate-fade-in glass">
                  <div className="flex items-center gap-3 mb-2">
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
                    <input
                      type="text"
                      value={channel.customName !== undefined ? channel.customName : channel.label}
                      onChange={(e) => updateChannelName(channel.id, e.target.value)}
                      className="text-sm font-medium bg-transparent border-none outline-none hover:bg-white/5 focus:bg-white/10 rounded px-2 py-1 transition-all duration-200 w-32 flex-shrink-0"
                      style={{ 
                        color: isDark ? '#E5E7EB' : '#374151' 
                      }}
                      placeholder={channel.label}
                      title="Click to edit channel name"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      {channel.dataCount} pts
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 pl-7">
                    <div>Min: {stats.min}°C • Max: {stats.max}°C</div>
                    <div>Avg: {stats.avg}°C</div>
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
          className={`flex-1 relative animate-fade-in ${currentView === 'table' ? 'p-0 overflow-hidden' : 'p-6'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* PDF Export Loading Overlay */}
          {isExportingPDF && (
            <div 
              className="absolute inset-0 z-20 flex items-center justify-center"
              style={{
                backgroundColor: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px'
              }}
            >
              <LoadingSpinner
                size="large"
                text="Generating PDF export..."
                isDark={isDark}
              />
            </div>
          )}
          {isLoadingCSV ? (
            <div className="h-full flex items-center justify-center">
              <LoadingSpinner
                size="large"
                text="Processing CSV data..."
                isDark={isDark}
              />
            </div>
          ) : data.length > 0 ? (
            <div 
              className="h-full w-full animate-fade-in"
            >
              <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                <div 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    visibility: currentView === 'chart' ? 'visible' : 'hidden',
                    zIndex: currentView === 'chart' ? 1 : 0
                  }}
                >
                  {/* Chart settling overlay */}
                  {isChartSettling && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: isDark ? '#111827' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#4B5563' : '#E0E0E0'}`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 20,
                        fontSize: '14px',
                        color: isDark ? '#9CA3AF' : '#6B7280'
                      }}
                    >
                      Rendering chart...
                    </div>
                  )}
                  
                  <ChartArea
                    ref={chartRef}
                    data={data}
                    channels={chartChannels}
                    displayMode={chartMode}
                    isDark={isDark}
                    timeMapping={timeMapping}
                    reconstructedTime={reconstructedTime}
                    logoUrl={logoUrl}
                    clientName={clientName}
                  />
                </div>
                <div 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    visibility: currentView === 'table' ? 'visible' : 'hidden',
                    zIndex: currentView === 'table' ? 1 : 0
                  }}
                >
                  <DataTableView
                    rawCSVData={rawCSVData}
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={`h-full border-2 border-dashed rounded-xl flex items-center justify-center transition-colors ${
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
        <footer className={`h-14 px-6 py-3 border-l border-r border-b border-t flex items-center gap-4 flex-shrink-0 animate-slide-up rounded-b-xl glass-panel ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <button 
          disabled={!data.length}
          onClick={handleResetZoom}
          className="btn-glass text-xs px-3 py-2 hover-lift"
        >
          Reset Zoom
        </button>
        
        <select 
          disabled={!data.length}
          value={chartMode.type === 'both' ? 'both' : chartMode.type}
          onChange={(e) => handleChartModeChange(e.target.value)}
          className="px-2 py-1 text-xs rounded-lg transition-all duration-200 backdrop-blur-sm disabled:opacity-50 glass"
          style={{ 
            color: isDark ? '#E5E7EB' : '#374151' 
          }}
        >
          <option value="both">Line + Scatter</option>
          <option value="line">Line Only</option>
          <option value="scatter">Scatter Only</option>
        </select>
        
        <button 
          onClick={() => setIsDark(!isDark)}
          className="btn-glass text-xs px-3 py-2 hover-lift"
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
            className="w-20 px-3 py-2 text-xs rounded-lg transition-all duration-200 backdrop-blur-sm disabled:opacity-50 text-gray-900 dark:text-white glass"
          />
          <button 
            disabled={!data.length || !jumpToTime}
            onClick={handleJumpToTime}
            className="btn-glass text-xs px-3 py-2 hover-lift"
          >
            Go
          </button>
        </div>
        
        {/* License Status Display */}
        {licenseStatus.valid && (
          <div className={`flex items-center gap-2 ml-auto px-3 py-1 rounded-lg backdrop-blur-sm border ${isDark ? 'bg-white/10 border-white/20' : 'bg-black/5 border-gray-300'}`}>
            <div className={`w-2 h-2 rounded-full ${
              licenseStatus.daysRemaining <= 0.1 ? 'bg-red-400' : 
              licenseStatus.daysRemaining <= 1 ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
            <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {(() => {
                const totalMinutes = licenseStatus.daysRemaining * 24 * 60;
                if (totalMinutes < 60) {
                  const minutes = Math.ceil(totalMinutes);
                  return minutes === 1 ? '1 minute left' : `${minutes} minutes left`;
                } else if (totalMinutes < 1440) { // Less than 24 hours
                  const hours = Math.ceil(totalMinutes / 60);
                  return hours === 1 ? '1 hour left' : `${hours} hours left`;
                } else {
                  const days = Math.ceil(licenseStatus.daysRemaining);
                  return days === 1 ? '1 day left' : `${days} days left`;
                }
              })()}
            </span>
            {licenseStatus.daysRemaining <= 1 && (
              <button
                onClick={handleRenewLicense}
                className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Renew
              </button>
            )}
          </div>
        )}
        </footer>
      </div>

      {/* Error Dialog */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="p-6 rounded-xl max-w-md mx-4 animate-scale-in glass-panel">
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

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        isDark={isDark}
      />
      
      {/* License Modal Overlay - shows when license expires during runtime */}
      {(!licenseStatus.valid || licenseStatus.showLicenseModal) && licenseStatus.error !== 'No license found' && (
        <LicenseModal
          onLicenseValidated={handleLicenseValidated}
          initialError={licenseStatus.error}
        />
      )}
    </div>
    </>
  );
}

export default App;