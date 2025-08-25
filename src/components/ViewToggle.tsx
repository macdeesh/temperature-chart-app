// FILE: src/components/ViewToggle.tsx
// Toggle component for switching between Chart and Data Table views

interface ViewToggleProps {
  currentView: 'chart' | 'table';
  onViewChange: (view: 'chart' | 'table') => void;
  isDark?: boolean;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  isDark = false
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onViewChange('chart')}
        className={`px-3 py-1.5 flex items-center space-x-2 rounded-lg transition-all duration-200 backdrop-blur-sm text-sm whitespace-nowrap ${
          currentView === 'chart'
            ? (isDark 
                ? 'bg-white/15 text-gray-200 shadow-inset border border-white/20' 
                : 'bg-black/8 text-gray-700 shadow-inset border border-black/10')
            : (isDark 
                ? 'bg-black/20 text-gray-300 hover:bg-white/10 border border-white/10' 
                : 'bg-white/10 text-gray-700 hover:bg-white/20 border border-white/20')
        }`}
        style={currentView === 'chart' ? {
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
        } : {}}
        title="Switch to chart visualization"
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
        <span>Chart View</span>
      </button>
      
      <button
        onClick={() => onViewChange('table')}
        className={`px-3 py-1.5 flex items-center space-x-2 rounded-lg transition-all duration-200 backdrop-blur-sm text-sm whitespace-nowrap ${
          currentView === 'table'
            ? (isDark 
                ? 'bg-white/15 text-gray-200 shadow-inset border border-white/20' 
                : 'bg-black/8 text-gray-700 shadow-inset border border-black/10')
            : (isDark 
                ? 'bg-black/20 text-gray-300 hover:bg-white/10 border border-white/10' 
                : 'bg-white/10 text-gray-700 hover:bg-white/20 border border-white/20')
        }`}
        style={currentView === 'table' ? {
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
        } : {}}
        title="Switch to data table view"
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V10z" 
          />
        </svg>
        <span>Data View</span>
      </button>
    </div>
  );
};

export default ViewToggle;