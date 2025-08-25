// FILE: src/components/UserGuideModal.tsx
// Comprehensive user guide modal for VizTherm Temperature Chart Application

import { useState } from 'react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  isDark = false
}) => {
  const [activeSection, setActiveSection] = useState('getting-started');

  if (!isOpen) return null;

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'importing-data', title: 'Importing Data', icon: '📁' },
    { id: 'chart-navigation', title: 'Chart Navigation', icon: '🎯' },
    { id: 'data-table-view', title: 'Data Table View', icon: '📋' },
    { id: 'customization', title: 'Customization', icon: '🎨' },
    { id: 'export-features', title: 'Export Features', icon: '💾' },
    { id: 'keyboard-shortcuts', title: 'Keyboard Shortcuts', icon: '⌨️' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔧' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Welcome to VizTherm!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              VizTherm is a professional engineering-grade temperature visualization tool designed for 
              engineers analyzing temperature data from manufacturing and testing equipment.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Key Features:</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Up to 12 temperature channels with custom naming and colors</li>
                <li>• Professional time axis with gap handling for real-world data</li>
                <li>• Raw CSV data table view for complete data visibility</li>
                <li>• Advanced zoom/pan navigation with keyboard shortcuts</li>
                <li>• Professional PDF export with company branding</li>
                <li>• Session management to save and reload your work</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Chart View</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Professional temperature visualization with engineering-grade precision
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">📋</div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Data View</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete raw CSV data visibility including errors and invalid values
                </p>
              </div>
            </div>
          </div>
        );

      case 'importing-data':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Importing Temperature Data
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Supported File Formats</h4>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-green-800 dark:text-green-300 font-medium mb-2">✅ CSV Files (.csv)</p>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li>• Comma-separated (,) or semicolon-separated (;) values</li>
                    <li>• Time formats: HH:MM or HH:MM:SS</li>
                    <li>• Temperature range: -100°C to 1400°C</li>
                    <li>• Up to 12 temperature channels maximum</li>
                    <li>• Maximum 5000 data rows supported</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">How to Import</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">Click "Import CSV" Button</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Located in the top toolbar</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">Drag & Drop</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Drag CSV files directly onto the application</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border-l-4 border-amber-500">
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">💡 Pro Tips:</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                  <li>• VizTherm automatically detects delimiters (, or ;)</li>
                  <li>• Missing seconds are reconstructed using pattern detection</li>
                  <li>• Time gaps larger than 2 minutes show as line breaks</li>
                  <li>• Invalid data like "Sotto Scala" is highlighted in red</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'chart-navigation':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Chart Navigation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">🖱️ Mouse Controls</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Left/Right Pan</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Click and drag horizontally</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Up/Down Pan</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Hold Shift + drag vertically</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Time Zoom</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vertical scroll (mouse wheel or trackpad)</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Temperature Zoom</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Shift + vertical scroll</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">⌨️ Keyboard Navigation</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Pan Navigation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ctrl + Arrow Keys</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Zoom In/Out</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ctrl + Plus/Minus</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Reset View</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ctrl + 0</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">🎯 Jump to Time Feature</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                Quickly navigate to specific time points in your data:
              </p>
              <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>1. Enter time in HH:MM format (e.g., "11:05") in the bottom-right input</li>
                <li>2. Click "Go" or press Enter</li>
                <li>3. Chart automatically centers around that time with optimal context</li>
              </ol>
            </div>
          </div>
        );

      case 'data-table-view':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Data Table View
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              The Data Table View provides complete visibility into your CSV data, including errors 
              and invalid values that might not appear in the chart visualization.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">🔄 Switching Views</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Use the toggle buttons in the top toolbar:
                  </p>
                  <div className="flex space-x-2">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Chart View</span>
                    <span className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm">Data View</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">📊 What You'll See</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-xl mb-2">✅</div>
                    <p className="font-medium text-green-800 dark:text-green-300">Valid Data</p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Time values (blue) and temperature readings (normal text)
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <div className="text-xl mb-2">⚠️</div>
                    <p className="font-medium text-red-800 dark:text-red-300">Errors & Issues</p>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      "Sotto Scala", empty cells, and invalid values (red highlighting)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">🔍 Navigation Features</h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Horizontal scrolling:</strong> View all 12+ temperature channels</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Vertical scrolling:</strong> Browse through up to 5000 data rows</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Time precision:</strong> See original timestamps including seconds</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border-l-4 border-amber-500">
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">💡 Why Use Data View?</h4>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Engineers often need to understand why certain channels are missing from charts 
                  or why data appears unusual. The Data View shows <em>exactly</em> what's in your 
                  CSV file, helping you identify data quality issues without leaving the application.
                </p>
              </div>
            </div>
          </div>
        );

      case 'customization':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Customization Options
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">🏷️ Channel Customization</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked className="w-4 h-4" readOnly />
                      <div className="w-5 h-5 bg-red-500 rounded border"></div>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">Thermocouple A</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">245 pts</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 pl-8">
                      Click channel names to edit • Click colors to change • Toggle visibility with checkboxes
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">🏢 Company Branding</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🏢</span>
                      </div>
                      <input 
                        type="text" 
                        value="Your Company Name" 
                        className="bg-transparent border-b border-gray-300 dark:border-gray-600 px-2 py-1"
                        readOnly
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      • Click logo to upload your company logo (PNG, JPG, SVG)
                      <br />
                      • Click company name to edit
                      <br />
                      • Logo appears in chart and PDF exports
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">🌓 Theme Options</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Switch between light and dark themes using the theme toggle in the bottom toolbar.
                  </p>
                  <div className="flex space-x-2">
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">☀️ Light Mode</span>
                    <span className="px-3 py-1 bg-gray-700 text-gray-200 rounded text-sm">🌙 Dark Mode</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">📊 Chart Display Modes</h4>
                <div className="space-y-2">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Line + Scatter</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Shows both connected lines and individual data points</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Line Only</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Clean line visualization for trend analysis</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Scatter Only</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Individual data points without connections</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'export-features':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Export & Session Features
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">📄 Professional PDF Export</h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-300 mb-3">
                    Generate high-resolution PDF reports with professional formatting:
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Landscape orientation optimized for temperature charts</li>
                    <li>• High-resolution (3x pixel ratio) for crisp printing</li>
                    <li>• Company logo and branding integrated</li>
                    <li>• Automatic filename with timestamp</li>
                    <li>• Perfect for reports and documentation</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">📁 File Naming Convention</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    [filename]-YYYY-MM-DD_HH-MM.pdf
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Example: temperature-data-2024-01-23_14-30.pdf
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">💼 Session Management (.tdproj)</h4>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-green-800 dark:text-green-300 mb-3">
                    Save/load complete analysis sessions with all settings preserved:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300 mb-1">Save Session</p>
                      <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                        <li>• Chart zoom and view state</li>
                        <li>• Channel customizations</li>
                        <li>• Company branding</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300 mb-1">Load Session</p>
                      <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                        <li>• Instant data restoration</li>
                        <li>• Perfect for collaboration</li>
                        <li>• Resume where you left off</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">🚀 Export Process</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">Choose Export Type</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Click "Export PDF" for reports or "Save Session" for project files</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">Select Location</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Choose where to save your file</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">Processing Complete</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">File is generated with professional formatting</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );


      case 'keyboard-shortcuts':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Keyboard Shortcuts
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Master these keyboard shortcuts for efficient chart navigation and analysis.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">🎯 Chart Navigation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 dark:text-gray-200">Pan Left</span>
                        <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">Ctrl + ←</kbd>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 dark:text-gray-200">Pan Right</span>
                        <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">Ctrl + →</kbd>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 dark:text-gray-200">Pan Up</span>
                        <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">Ctrl + ↑</kbd>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 dark:text-gray-200">Pan Down</span>
                        <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">Ctrl + ↓</kbd>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 dark:text-gray-200">Zoom In</span>
                        <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">Ctrl + +</kbd>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 dark:text-gray-200">Zoom Out</span>
                        <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">Ctrl + -</kbd>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 dark:text-gray-200">Reset Zoom</span>
                        <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">Ctrl + 0</kbd>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 dark:text-gray-200">Focus Chart</span>
                        <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">Click</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">⚡ Quick Actions</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-800 dark:text-gray-200 font-medium">Jump to Time</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Type time in jump box, then press Enter</p>
                      </div>
                      <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">Enter</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">🎯 Navigation Tips</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Click the chart area first to focus before using keyboard shortcuts</li>
                  <li>• Pan in 5% increments for precise navigation</li>
                  <li>• Zoom changes both time and temperature axes proportionally</li>
                  <li>• Use Ctrl+0 anytime to return to full data view</li>
                  <li>• Combine keyboard and mouse navigation for optimal efficiency</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">⌨️ For Mac Users</h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Replace <kbd className="bg-green-200 dark:bg-green-800 px-1 py-0.5 rounded text-xs">Ctrl</kbd> with 
                  <kbd className="bg-green-200 dark:bg-green-800 px-1 py-0.5 rounded text-xs">Cmd</kbd> in all shortcuts above.
                </p>
              </div>
            </div>
          </div>
        );

      case 'troubleshooting':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Troubleshooting
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Common issues and solutions for VizTherm Temperature Chart Application.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">📁 CSV Import Issues</h4>
                <div className="space-y-3">
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-l-4 border-red-500">
                    <p className="font-medium text-red-800 dark:text-red-300 mb-1">Problem: "File format not supported"</p>
                    <p className="text-sm text-red-700 dark:text-red-400 mb-2"><strong>Solution:</strong></p>
                    <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                      <li>• Ensure file extension is .csv</li>
                      <li>• Check that data is separated by commas (,) or semicolons (;)</li>
                      <li>• Verify first column contains time data (HH:MM or HH:MM:SS format)</li>
                      <li>• Remove any special formatting or merged cells</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-l-4 border-red-500">
                    <p className="font-medium text-red-800 dark:text-red-300 mb-1">Problem: "Too many rows" error</p>
                    <p className="text-sm text-red-700 dark:text-red-400 mb-2"><strong>Solution:</strong></p>
                    <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                      <li>• VizTherm supports up to 5000 data rows</li>
                      <li>• Consider filtering data to key time periods</li>
                      <li>• Split large datasets into multiple sessions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">📊 Chart Display Issues</h4>
                <div className="space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border-l-4 border-amber-500">
                    <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">Problem: Missing temperature channels in chart</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-2"><strong>Check:</strong></p>
                    <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                      <li>• Switch to Data View to see all CSV content including errors</li>
                      <li>• Look for "Sotto Scala" or invalid values that prevent charting</li>
                      <li>• Verify channel checkbox is enabled in left sidebar</li>
                      <li>• Check if temperature values are within -100°C to 1400°C range</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border-l-4 border-amber-500">
                    <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">Problem: Chart appears blank or frozen</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-2"><strong>Solution:</strong></p>
                    <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                      <li>• Press Ctrl+0 to reset zoom to full view</li>
                      <li>• Try switching chart display mode (Line/Scatter/Both)</li>
                      <li>• Toggle theme (Dark/Light) to refresh chart</li>
                      <li>• Check that at least one channel is visible and enabled</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">💾 Session and Export Issues</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">Problem: Session file won't load</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-2"><strong>Solution:</strong></p>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <li>• Ensure file extension is .tdproj</li>
                      <li>• Try creating a new session with same data</li>
                      <li>• Check file wasn't corrupted during transfer</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">Problem: PDF export fails or appears blank</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-2"><strong>Solution:</strong></p>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <li>• Ensure chart is fully loaded before exporting</li>
                      <li>• Try zooming out to full view before export</li>
                      <li>• Check available disk space</li>
                      <li>• Switch to different theme if export appears corrupted</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">🎯 Performance Issues</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-500">
                    <p className="font-medium text-green-800 dark:text-green-300 mb-1">Optimization Tips</p>
                    <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                      <li>• Hide unused channels to improve performance</li>
                      <li>• Use Line mode instead of Line + Scatter for large datasets</li>
                      <li>• Close other applications if experiencing slowness</li>
                      <li>• Consider splitting very large CSV files</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">🆘 Still Need Help?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  If you're still experiencing issues after trying these solutions:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>1. Note the exact error message or behavior</li>
                  <li>2. Check if the issue occurs with sample data</li>
                  <li>3. Try restarting the application</li>
                  <li>4. Consider the CSV data format and structure</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-6xl h-5/6 rounded-xl shadow-2xl flex overflow-hidden ${
        isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        
        {/* Sidebar Navigation */}
        <div className={`w-80 flex-shrink-0 border-r overflow-y-auto ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                📖 User Guide
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700`}
                title="Close Guide"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
                      : (isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700')
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{section.icon}</span>
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuideModal;