// FILE: src/components/LoadingSpinner.tsx
// Reusable loading spinner component for various loading states across the application

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  isDark?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text,
  isDark = false,
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const spinnerColor = isDark ? 'border-blue-400' : 'border-blue-600';
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Spinning Circle */}
      <div 
        className={`${sizeClasses[size]} border-2 ${spinnerColor} border-t-transparent rounded-full animate-spin`}
        style={{
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent'
        }}
      />
      
      {/* Loading Text */}
      {text && (
        <div className={`${textSizeClasses[size]} font-medium ${textColor} animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;