import React from 'react';
import { Clock } from 'lucide-react';
import { TimeFrame } from '../types';

interface TimeframeSelectorProps {
  timeFrame: TimeFrame;
  onChange: (timeFrame: TimeFrame) => void;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ 
  timeFrame, 
  onChange 
}) => {
  const timeframes: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d'];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold flex items-center">
          <Clock size={18} className="mr-2" />
          Timeframe
        </h2>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => onChange(tf)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeFrame === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeframeSelector;