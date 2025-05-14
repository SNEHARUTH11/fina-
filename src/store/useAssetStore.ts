import { create } from 'zustand';
import { Asset, CandlestickData, TimeFrame, CandlePattern } from '../types';
import { 
  generateAssets, 
  generateHistoricalData, 
  generateNextCandle, 
  generateVolatility 
} from '../utils/dataGenerator';
import { detectPatterns } from '../utils/patternDetection';

interface AssetState {
  assets: Asset[];
  selectedAssetId: string;
  timeFrame: TimeFrame;
  candleData: Record<string, CandlestickData[]>;
  volatility: Record<string, number>;
  patterns: Record<string, CandlePattern[]>;
  // Actions
  selectAsset: (assetId: string) => void;
  setTimeFrame: (timeFrame: TimeFrame) => void;
  updateCandles: () => void;
  initializeData: () => void;
}

// Get interval in seconds based on timeframe
const getIntervalSeconds = (timeFrame: TimeFrame): number => {
  switch (timeFrame) {
    case '1m': return 60;
    case '5m': return 300;
    case '15m': return 900;
    case '1h': return 3600;
    case '4h': return 14400;
    case '1d': return 86400;
    default: return 60;
  }
};

// Number of candles to generate for initial history
const INITIAL_CANDLE_COUNT = 100;

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  selectedAssetId: '',
  timeFrame: '15m',
  candleData: {},
  volatility: {},
  patterns: {},
  
  selectAsset: (assetId: string) => set({ selectedAssetId: assetId }),
  
  setTimeFrame: (timeFrame: TimeFrame) => set({ timeFrame }),
  
  updateCandles: () => {
    const { assets, candleData, volatility, timeFrame } = get();
    const intervalSeconds = getIntervalSeconds(timeFrame);
    
    // Create a new object to update immutably
    const updatedCandleData: Record<string, CandlestickData[]> = { ...candleData };
    const updatedPatterns: Record<string, CandlePattern[]> = { ...get().patterns };
    
    assets.forEach(asset => {
      if (updatedCandleData[asset.id] && updatedCandleData[asset.id].length > 0) {
        // Generate next candle based on previous data
        const nextCandle = generateNextCandle(
          updatedCandleData[asset.id], 
          intervalSeconds, 
          volatility[asset.id]
        );
        
        // Add to the data array
        updatedCandleData[asset.id] = [...updatedCandleData[asset.id], nextCandle];
        
        // Keep only the last 500 candles to prevent memory issues
        if (updatedCandleData[asset.id].length > 500) {
          updatedCandleData[asset.id] = updatedCandleData[asset.id].slice(-500);
        }
        
        // Detect patterns for this asset
        updatedPatterns[asset.id] = detectPatterns(updatedCandleData[asset.id]);
      }
    });
    
    set({ 
      candleData: updatedCandleData,
      patterns: updatedPatterns
    });
  },
  
  initializeData: () => {
    const assets = generateAssets();
    const selectedAssetId = assets[0].id;
    const timeFrame = '15m';
    const intervalSeconds = getIntervalSeconds(timeFrame);
    
    // Initialize volatility for each asset
    const volatility: Record<string, number> = {};
    const candleData: Record<string, CandlestickData[]> = {};
    const patterns: Record<string, CandlePattern[]> = {};
    
    assets.forEach(asset => {
      // Generate unique volatility for each asset
      volatility[asset.id] = generateVolatility();
      
      // Generate historical data
      candleData[asset.id] = generateHistoricalData(
        INITIAL_CANDLE_COUNT, 
        intervalSeconds, 
        volatility[asset.id]
      );
      
      // Detect initial patterns
      patterns[asset.id] = detectPatterns(candleData[asset.id]);
    });
    
    set({ 
      assets, 
      selectedAssetId, 
      timeFrame, 
      candleData, 
      volatility,
      patterns 
    });
  }
}));