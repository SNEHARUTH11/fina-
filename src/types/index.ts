export type Asset = {
  id: string;
  symbol: string;
  name: string;
  color: string;
};

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export type CandlestickData = {
  time: number;
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
};

export type CandlePattern = {
  name: string;
  description: string;
  time: number;
  significance: 'bullish' | 'bearish' | 'neutral';
};

export type PriceAlert = {
  id: string;
  assetId: string;
  price: number;
  condition: 'above' | 'below';
  triggered: boolean;
  createdAt: number;
};

export type Order = {
  id: string;
  assetId: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  status: 'pending' | 'filled' | 'canceled';
  createdAt: number;
  filledAt?: number;
};

export type PortfolioHolding = {
  assetId: string;
  amount: number;
  averagePrice: number;
};

export type TradingBotConfig = {
  enabled: boolean;
  strategy: 'sma' | 'buyLowSellHigh' | 'rsi';
  params: {
    buyThreshold?: number;
    sellThreshold?: number;
    shortPeriod?: number;
    longPeriod?: number;
    rsiPeriod?: number;
    rsiOverbought?: number;
    rsiOversold?: number;
  };
};