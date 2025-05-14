import React from 'react';
import { Asset, CandlestickData } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketOverviewProps {
  assets: Asset[];
  candleData: Record<string, CandlestickData[]>;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ assets, candleData }) => {
  const calculateChange = (data: CandlestickData[]): { price: number; change: number; percentage: number } => {
    if (!data || data.length < 2) return { price: 0, change: 0, percentage: 0 };
    
    const current = data[data.length - 1].close;
    const previous = data[data.length - 2].close;
    const change = current - previous;
    const percentage = (change / previous) * 100;
    
    return { price: current, change, percentage };
  };

  return (
    <div className="card-3d">
      <div className="p-6 border-b dark:border-gray-700">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-groww-blue to-blue-400 bg-clip-text text-transparent">
          Market Overview
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6">
        {assets.map(asset => {
          const data = candleData[asset.id];
          const { price, change, percentage } = calculateChange(data || []);
          const isPositive = change >= 0;
          
          return (
            <div
              key={asset.id}
              className="market-card group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={`https://images.pexels.com/photos/${getAssetImage(asset.symbol)}/pexels-photo-${getAssetImage(asset.symbol)}.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2`}
                    alt={asset.name}
                    className="w-10 h-10 rounded-full mr-3 floating"
                  />
                  <div>
                    <h3 className="text-lg font-bold">{asset.symbol}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</p>
                  </div>
                </div>
                {isPositive ? (
                  <TrendingUp size={20} className="text-green-500 transform transition-transform group-hover:scale-110" />
                ) : (
                  <TrendingDown size={20} className="text-red-500 transform transition-transform group-hover:scale-110" />
                )}
              </div>
              
              <div className="relative mt-6 mb-4">
                <div className="h-16 w-full bg-gray-100/50 dark:bg-gray-800/50 rounded-lg overflow-hidden backdrop-blur-sm">
                  <div 
                    className={`h-full ${
                      isPositive 
                        ? 'bg-green-100/50 dark:bg-green-900/30' 
                        : 'bg-red-100/50 dark:bg-red-900/30'
                    } transition-all duration-500 ease-out`}
                    style={{
                      width: `${Math.min(Math.abs(percentage * 2), 100)}%`,
                    }}
                  />
                </div>
                <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                  <div className="text-xl font-bold tracking-tight">
                    ${price.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`text-sm font-semibold ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isPositive ? '+' : ''}{change.toFixed(2)} ({percentage.toFixed(2)}%)
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getVolumeClass(data?.[data.length - 1]?.volume || 0)
                }`}>
                  Vol: {formatVolume(data?.[data.length - 1]?.volume || 0)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper functions
const getAssetImage = (symbol: string): string => {
  const images: Record<string, string> = {
    'BTC': '844124',   // Gold/cryptocurrency related image
    'ETH': '730547',   // Technology/network related image
    'AAPL': '1294886', // Modern office/tech image
    'MSFT': '1181244', // Computer/software related image
    'AMZN': '2882634', // E-commerce/delivery related image
    'TSLA': '3802510', // Electric car/future tech image
    'GOOG': '1591060', // Data center/tech campus image
    'META': '1552617', // Social media/connectivity image
    'NFLX': '2726370', // Entertainment/streaming image
    'DIS': '2425011',  // Entertainment/magic related image
  };
  return images[symbol] || '844124';
};

const formatVolume = (volume: number): string => {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
  return volume.toString();
};

const getVolumeClass = (volume: number): string => {
  if (volume >= 1000000) {
    return 'bg-purple-100/50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
  }
  if (volume >= 100000) {
    return 'bg-blue-100/50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  }
  return 'bg-gray-100/50 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
};

export default MarketOverview;