import React from 'react';
import { Briefcase } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { Asset } from '../types';

interface PortfolioComponentProps {
  assets: Asset[];
  currentPrices: Record<string, number>;
}

const PortfolioComponent: React.FC<PortfolioComponentProps> = ({ 
  assets, 
  currentPrices 
}) => {
  const { portfolio, balance } = useOrderStore();
  
  // Get asset name by ID
  const getAssetName = (assetId: string): string => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.symbol : 'Unknown';
  };
  
  // Calculate portfolio value
  const getTotalValue = (): number => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = currentPrices[holding.assetId] || 0;
      return total + (holding.amount * currentPrice);
    }, balance);
  };
  
  // Calculate profit/loss for a holding
  const getProfitLoss = (holding: {assetId: string, amount: number, averagePrice: number}): {
    value: number;
    percentage: number;
  } => {
    const currentPrice = currentPrices[holding.assetId] || 0;
    const value = (currentPrice - holding.averagePrice) * holding.amount;
    const percentage = (currentPrice / holding.averagePrice - 1) * 100;
    
    return {
      value,
      percentage
    };
  };
  
  const totalValue = getTotalValue();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold flex items-center">
          <Briefcase size={18} className="mr-2" />
          Portfolio
        </h2>
      </div>
      
      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex flex-col">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Value:</span>
            <span className="font-bold">${totalValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Cash Balance:</span>
            <span className="font-medium">${balance.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {portfolio.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No assets in portfolio
          </div>
        ) : (
          portfolio.map(holding => {
            const profitLoss = getProfitLoss(holding);
            const currentPrice = currentPrices[holding.assetId] || 0;
            const holdingValue = holding.amount * currentPrice;
            
            return (
              <div key={holding.assetId} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{getAssetName(holding.assetId)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {holding.amount.toFixed(4)} × ${currentPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${holdingValue.toFixed(2)}</div>
                    <div className={`text-sm ${
                      profitLoss.value >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {profitLoss.value >= 0 ? '+' : ''}${profitLoss.value.toFixed(2)} ({profitLoss.percentage.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PortfolioComponent;