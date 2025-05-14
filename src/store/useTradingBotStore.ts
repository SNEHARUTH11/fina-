import { create } from 'zustand';
import { TradingBotConfig } from '../types';
import { makeTradingDecision, createOrderFromDecision } from '../utils/tradingBot';
import { useAssetStore } from './useAssetStore';
import { useOrderStore } from './useOrderStore';

interface TradingBotState {
  botConfig: Record<string, TradingBotConfig>;
  updateBotConfig: (assetId: string, config: Partial<TradingBotConfig>) => void;
  runTradingBot: (assetId: string) => void;
}

// Default amount to trade per bot transaction
const DEFAULT_TRADE_AMOUNT = 0.1;

export const useTradingBotStore = create<TradingBotState>((set, get) => ({
  botConfig: {},
  
  updateBotConfig: (assetId, config) => {
    set(state => {
      const currentConfig = state.botConfig[assetId] || {
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
      
      return {
        botConfig: {
          ...state.botConfig,
          [assetId]: {
            ...currentConfig,
            ...config,
            params: {
              ...currentConfig.params,
              ...(config.params || {})
            }
          }
        }
      };
    });
  },
  
  runTradingBot: (assetId) => {
    const config = get().botConfig[assetId];
    if (!config || !config.enabled) return;
    
    // Get candle data for this asset
    const assetStore = useAssetStore.getState();
    const candleData = assetStore.candleData[assetId];
    if (!candleData || candleData.length < 30) return;
    
    // Make trading decision
    const decision = makeTradingDecision(candleData, config);
    
    // If decision is to buy or sell, create an order
    if (decision.action !== 'hold') {
      const order = createOrderFromDecision(decision, assetId, DEFAULT_TRADE_AMOUNT);
      if (order) {
        // Place the order
        const orderStore = useOrderStore.getState();
        orderStore.placeOrder(order);
        
        console.log(`Bot ${decision.action} order placed: ${decision.reason}`);
      }
    }
  }
}));