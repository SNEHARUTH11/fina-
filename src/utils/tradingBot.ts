import { CandlestickData, TradingBotConfig, Order } from '../types';

type TradingDecision = {
  action: 'buy' | 'sell' | 'hold';
  reason: string;
  price: number;
};

/**
 * Calculate Simple Moving Average
 */
const calculateSMA = (candles: CandlestickData[], period: number): number => {
  if (candles.length < period) return 0;
  
  const prices = candles.slice(-period).map(candle => candle.close);
  return prices.reduce((sum, price) => sum + price, 0) / period;
};

/**
 * Calculate RSI (Relative Strength Index)
 */
const calculateRSI = (candles: CandlestickData[], period: number): number => {
  if (candles.length < period + 1) return 50; // Default to neutral
  
  let gains = 0;
  let losses = 0;
  
  // Calculate price changes
  for (let i = candles.length - period; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change; // Make losses positive
    }
  }
  
  // Avoid division by zero
  if (losses === 0) return 100;
  
  // Calculate average gains and losses
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  // Calculate RS and RSI
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

/**
 * Simple Moving Average strategy
 */
const smaStrategy = (
  candles: CandlestickData[],
  config: TradingBotConfig
): TradingDecision => {
  const shortPeriod = config.params.shortPeriod || 9;
  const longPeriod = config.params.longPeriod || 21;
  
  const shortSMA = calculateSMA(candles, shortPeriod);
  const longSMA = calculateSMA(candles, longPeriod);
  
  const currentPrice = candles[candles.length - 1].close;
  
  if (shortSMA > longSMA) {
    return {
      action: 'buy',
      reason: `Short-term SMA (${shortPeriod}) above long-term SMA (${longPeriod})`,
      price: currentPrice
    };
  } else if (shortSMA < longSMA) {
    return {
      action: 'sell',
      reason: `Short-term SMA (${shortPeriod}) below long-term SMA (${longPeriod})`,
      price: currentPrice
    };
  }
  
  return {
    action: 'hold',
    reason: 'SMAs are too close - no clear signal',
    price: currentPrice
  };
};

/**
 * Buy Low Sell High strategy
 */
const buyLowSellHighStrategy = (
  candles: CandlestickData[],
  config: TradingBotConfig
): TradingDecision => {
  const buyThreshold = config.params.buyThreshold || 0.03; // 3% drop
  const sellThreshold = config.params.sellThreshold || 0.05; // 5% rise
  
  const currentPrice = candles[candles.length - 1].close;
  
  // Calculate average price of last 10 candles
  const avgPrice = calculateSMA(candles, 10);
  
  const priceDiff = (currentPrice - avgPrice) / avgPrice;
  
  if (priceDiff < -buyThreshold) {
    return {
      action: 'buy',
      reason: `Price dropped ${(priceDiff * -100).toFixed(2)}% below average - buying the dip`,
      price: currentPrice
    };
  } else if (priceDiff > sellThreshold) {
    return {
      action: 'sell',
      reason: `Price rose ${(priceDiff * 100).toFixed(2)}% above average - taking profit`,
      price: currentPrice
    };
  }
  
  return {
    action: 'hold',
    reason: 'Price within normal range',
    price: currentPrice
  };
};

/**
 * RSI Strategy - Buy oversold, sell overbought
 */
const rsiStrategy = (
  candles: CandlestickData[],
  config: TradingBotConfig
): TradingDecision => {
  const period = config.params.rsiPeriod || 14;
  const oversold = config.params.rsiOversold || 30;
  const overbought = config.params.rsiOverbought || 70;
  
  const rsi = calculateRSI(candles, period);
  const currentPrice = candles[candles.length - 1].close;
  
  if (rsi < oversold) {
    return {
      action: 'buy',
      reason: `RSI (${rsi.toFixed(2)}) below oversold threshold (${oversold})`,
      price: currentPrice
    };
  } else if (rsi > overbought) {
    return {
      action: 'sell',
      reason: `RSI (${rsi.toFixed(2)}) above overbought threshold (${overbought})`,
      price: currentPrice
    };
  }
  
  return {
    action: 'hold',
    reason: `RSI (${rsi.toFixed(2)}) within normal range`,
    price: currentPrice
  };
};

/**
 * Make a trading decision based on the bot's strategy
 */
export const makeTradingDecision = (
  candles: CandlestickData[],
  config: TradingBotConfig
): TradingDecision => {
  if (!config.enabled || candles.length < 30) {
    return {
      action: 'hold',
      reason: 'Trading bot disabled or insufficient data',
      price: candles.length > 0 ? candles[candles.length - 1].close : 0
    };
  }
  
  switch (config.strategy) {
    case 'sma':
      return smaStrategy(candles, config);
    case 'buyLowSellHigh':
      return buyLowSellHighStrategy(candles, config);
    case 'rsi':
      return rsiStrategy(candles, config);
    default:
      return {
        action: 'hold',
        reason: 'No valid strategy selected',
        price: candles[candles.length - 1].close
      };
  }
};

/**
 * Create a market order based on a trading decision
 */
export const createOrderFromDecision = (
  decision: TradingDecision,
  assetId: string,
  amount: number
): Order | null => {
  if (decision.action === 'hold') return null;
  
  return {
    id: Math.random().toString(36).substring(2, 15),
    assetId,
    type: 'market',
    side: decision.action,
    price: decision.price,
    amount,
    status: 'pending',
    createdAt: Date.now()
  };
};