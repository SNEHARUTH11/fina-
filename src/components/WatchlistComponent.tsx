import React from 'react';
import { Star, Plus } from 'lucide-react';
import { Asset, CandlestickData } from '../types';
import { useWatchlistStore } from '../store/useWatchlistStore';

interface WatchlistComponentProps {
  assets: Asset[];
  candleData: Record<string, CandlestickData[]>;
  onSelectAsset: (assetId: string) => void;
  selectedAssetId: string;
}

const WatchlistComponent: React.FC<WatchlistComponentProps> = ({
  assets,
  candleData,
  onSelectAsset,
  selectedAssetId,
}) => {
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
  
  // Get latest prices for all assets
  const getLatestPrice = (assetId: string) => {
    const data = candleData[assetId];
    if (!data || data.length === 0) return null;
    
    return data[data.length - 1].close;
  };
  
  // Calculate 24h price change
  const getPriceChange = (assetId: string) => {
    const data = candleData[assetId];
    if (!data || data.length < 24) return null;
    
    const latest = data[data.length - 1].close;
    const previous = data[data.length - 24].close;
    
    return {
      change: latest - previous,
      percentChange: ((latest - previous) / previous) * 100
    };
  };
  
  // Toggle asset in watchlist
  const toggleWatchlist = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation();
    
    if (isInWatchlist(assetId)) {
      removeFromWatchlist(assetId);
    } else {
      addToWatchlist(assetId);
    }
  };
  
  // Filter assets to show only watchlist if it's not empty
  const assetsToShow = watchlist.length > 0
    ? assets.filter(asset => watchlist.includes(asset.id))
    : assets;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold">Watchlist</h2>
        {watchlist.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Add assets to your watchlist
          </div>
        )}
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {assetsToShow.map(asset => {
          const price = getLatestPrice(asset.id);
          const priceChange = getPriceChange(asset.id);
          
          return (
            <div 
              key={asset.id}
              onClick={() => onSelectAsset(asset.id)}
              className={`p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedAssetId === asset.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => toggleWatchlist(e, asset.id)}
                  className="focus:outline-none"
                >
                  <Star 
                    size={20} 
                    className={`${
                      isInWatchlist(asset.id) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-400 dark:text-gray-500'
                    } transition-colors`}
                  />
                </button>
                <div>
                  <h3 className="font-medium">{asset.symbol}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</p>
                </div>
              </div>
              
              <div className="text-right">
                {price && (
                  <div className="font-medium">
                    ${price.toFixed(2)}
                  </div>
                )}
                {priceChange && (
                  <div className={`text-sm ${
                    priceChange.change >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {priceChange.change >= 0 ? '+' : ''}
                    {priceChange.percentChange.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {watchlist.length === 0 && (
        <div className="p-4 flex justify-center items-center text-gray-500 dark:text-gray-400">
          <Plus size={16} className="mr-2" />
          <span>Add assets to your watchlist</span>
        </div>
      )}
    </div>
  );
};

export default WatchlistComponent;