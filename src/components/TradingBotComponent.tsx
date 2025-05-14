import React, { useState } from 'react';
import { Bot, Activity, PlayCircle, StopCircle } from 'lucide-react';
import { useTradingBotStore } from '../store/useTradingBotStore';
import { Asset, TradingBotConfig } from '../types';

interface TradingBotComponentProps {
  asset: Asset;
}

const TradingBotComponent: React.FC<TradingBotComponentProps> = ({ asset }) => {
  const { botConfig, updateBotConfig } = useTradingBotStore();
  
  // Get bot configuration for this asset or use default
  const config = botConfig[asset.id] || {
    enabled: false,
    strategy: 'sma',
    params: {
      buyThreshold: 0.03,
      sellThreshold: 0.05,
      shortPeriod: 9,
      longPeriod: 21,
      rsiPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 30
    }
  };
  
  // State for handling form inputs
  const [strategy, setStrategy] = useState<'sma' | 'buyLowSellHigh' | 'rsi'>(config.strategy);
  const [params, setParams] = useState(config.params);
  
  // Handle enabling/disabling the bot
  const toggleBot = () => {
    updateBotConfig(asset.id, {
      ...config,
      enabled: !config.enabled
    });
  };
  
  // Handle strategy change
  const handleStrategyChange = (newStrategy: 'sma' | 'buyLowSellHigh' | 'rsi') => {
    setStrategy(newStrategy);
    updateBotConfig(asset.id, { 
      strategy: newStrategy 
    });
  };
  
  // Handle parameter change
  const handleParamChange = (name: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const newParams = {
      ...params,
      [name]: numValue
    };
    
    setParams(newParams);
    updateBotConfig(asset.id, { params: newParams });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center">
          <Bot size={18} className="mr-2" />
          Trading Bot
        </h2>
        <button
          onClick={toggleBot}
          className={`flex items-center px-3 py-1 rounded-md text-white text-sm ${
            config.enabled 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {config.enabled ? (
            <>
              <StopCircle size={16} className="mr-1" /> Stop Bot
            </>
          ) : (
            <>
              <PlayCircle size={16} className="mr-1" /> Start Bot
            </>
          )}
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trading Strategy
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStrategyChange('sma')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                strategy === 'sma'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Moving Averages
            </button>
            <button
              onClick={() => handleStrategyChange('buyLowSellHigh')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                strategy === 'buyLowSellHigh'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Buy Low Sell High
            </button>
            <button
              onClick={() => handleStrategyChange('rsi')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                strategy === 'rsi'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              RSI
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <Activity size={16} className="mr-1" />
            Strategy Parameters
          </h3>
          
          {/* SMA Parameters */}
          {strategy === 'sma' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Short Period
                </label>
                <input
                  type="number"
                  value={params.shortPeriod || 9}
                  onChange={(e) => handleParamChange('shortPeriod', e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Long Period
                </label>
                <input
                  type="number"
                  value={params.longPeriod || 21}
                  onChange={(e) => handleParamChange('longPeriod', e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          )}
          
          {/* Buy Low Sell High Parameters */}
          {strategy === 'buyLowSellHigh' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Buy Threshold (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={params.buyThreshold ? (params.buyThreshold * 100).toFixed(1) : 3.0}
                  onChange={(e) => handleParamChange('buyThreshold', (parseFloat(e.target.value) / 100).toString())}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Sell Threshold (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={params.sellThreshold ? (params.sellThreshold * 100).toFixed(1) : 5.0}
                  onChange={(e) => handleParamChange('sellThreshold', (parseFloat(e.target.value) / 100).toString())}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          )}
          
          {/* RSI Parameters */}
          {strategy === 'rsi' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  RSI Period
                </label>
                <input
                  type="number"
                  value={params.rsiPeriod || 14}
                  onChange={(e) => handleParamChange('rsiPeriod', e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Oversold Level
                </label>
                <input
                  type="number"
                  value={params.rsiOversold || 30}
                  onChange={(e) => handleParamChange('rsiOversold', e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Overbought Level
                </label>
                <input
                  type="number"
                  value={params.rsiOverbought || 70}
                  onChange={(e) => handleParamChange('rsiOverbought', e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {strategy === 'sma' && (
                <>The Moving Averages strategy buys when the short-term average crosses above the long-term average, and sells when it crosses below.</>
              )}
              {strategy === 'buyLowSellHigh' && (
                <>This strategy buys when price drops below average by the buy threshold percentage, and sells when it rises above average by the sell threshold percentage.</>
              )}
              {strategy === 'rsi' && (
                <>The RSI strategy buys when RSI goes below the oversold level (indicating an oversold condition), and sells when RSI goes above the overbought level.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingBotComponent;