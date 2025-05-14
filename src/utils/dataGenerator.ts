import { CandlestickData, Asset } from '../types';
import { addSeconds } from 'date-fns';

// Initial price range
const INITIAL_PRICE_MIN = 50;
const INITIAL_PRICE_MAX = 500;

// Volatility settings
const VOLATILITY_MIN = 0.001;
const VOLATILITY_MAX = 0.01;

// Volume settings
const VOLUME_BASE_MIN = 1000;
const VOLUME_BASE_MAX = 10000;
const VOLUME_MULTIPLIER_MIN = 0.5;
const VOLUME_MULTIPLIER_MAX = 2;

/**
 * Generate random initial price within range
 */
export const generateInitialPrice = (): number => {
  return INITIAL_PRICE_MIN + Math.random() * (INITIAL_PRICE_MAX - INITIAL_PRICE_MIN);
};

/**
 * Generate asset-specific volatility
 */
export const generateVolatility = (): number => {
  return VOLATILITY_MIN + Math.random() * (VOLATILITY_MAX - VOLATILITY_MIN);
};

/**
 * Generate a random price change based on previous price and volatility
 */
export const generatePriceChange = (previousPrice: number, volatility: number): number => {
  // Random walk with drift
  const changePercent = (Math.random() - 0.5) * volatility * 2;
  // Small upward bias (0.02%)
  const drift = 0.0002;
  return previousPrice * (1 + changePercent + drift);
};

/**
 * Generate a random volume
 */
export const generateVolume = (price: number): number => {
  const baseVolume = VOLUME_BASE_MIN + Math.random() * (VOLUME_BASE_MAX - VOLUME_BASE_MIN);
  const multiplier = VOLUME_MULTIPLIER_MIN + Math.random() * (VOLUME_MULTIPLIER_MAX - VOLUME_MULTIPLIER_MIN);
  return Math.round(baseVolume * multiplier * (price / 100));
};

/**
 * Generate a single candlestick
 */
export const generateCandle = (
  previousCandle: CandlestickData | null,
  time: number,
  volatility: number
): CandlestickData => {
  // If first candle, generate random starting price
  const previousClose = previousCandle ? previousCandle.close : generateInitialPrice();
  
  // Generate open price (slight gap from previous close occasionally)
  const gapChance = Math.random();
  const gapMultiplier = gapChance > 0.8 ? (Math.random() - 0.5) * volatility * 2 : 0;
  const open = previousClose * (1 + gapMultiplier);
  
  // Generate high, low, close
  const changeMultipliers = [
    Math.random() * volatility * 2, // For high
    -Math.random() * volatility * 2, // For low
    (Math.random() - 0.5) * volatility * 2, // For close
  ];
  
  // Ensure high is highest, low is lowest
  const highChange = Math.max(changeMultipliers[0], 0, changeMultipliers[2]);
  const lowChange = Math.min(changeMultipliers[1], 0, changeMultipliers[2]);
  const closeChange = changeMultipliers[2];
  
  const high = open * (1 + highChange);
  const low = open * (1 + lowChange);
  const close = open * (1 + closeChange);
  
  // Generate volume
  const volume = generateVolume(close);
  
  return {
    time,
    open,
    high,
    low,
    close,
    volume
  };
};

/**
 * Generate historical data for an asset
 */
export const generateHistoricalData = (
  count: number,
  intervalSeconds: number,
  volatility: number
): CandlestickData[] => {
  const now = Math.floor(Date.now() / 1000) - (count * intervalSeconds);
  let candles: CandlestickData[] = [];
  
  for (let i = 0; i < count; i++) {
    const time = now + (i * intervalSeconds);
    const previousCandle = candles.length > 0 ? candles[candles.length - 1] : null;
    candles.push(generateCandle(previousCandle, time, volatility));
  }
  
  return candles;
};

/**
 * Generate the next candle based on the previous data
 */
export const generateNextCandle = (
  previousCandles: CandlestickData[],
  intervalSeconds: number,
  volatility: number
): CandlestickData => {
  const previousCandle = previousCandles[previousCandles.length - 1];
  const time = previousCandle.time + intervalSeconds;
  return generateCandle(previousCandle, time, volatility);
};

/**
 * Generate predefined assets
 */
export const generateAssets = (): Asset[] => {
  return [
    { id: '1', symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
    { id: '2', symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
    { id: '3', symbol: 'AAPL', name: 'Apple Inc.', color: '#A2AAAD' },
    { id: '4', symbol: 'MSFT', name: 'Microsoft', color: '#00A4EF' },
    { id: '5', symbol: 'AMZN', name: 'Amazon', color: '#FF9900' },
    { id: '6', symbol: 'TSLA', name: 'Tesla', color: '#CC0000' },
    { id: '7', symbol: 'GOOG', name: 'Google', color: '#4285F4' },
    { id: '8', symbol: 'META', name: 'Meta', color: '#0668E1' },
    { id: '9', symbol: 'NFLX', name: 'Netflix', color: '#E50914' },
    { id: '10', symbol: 'DIS', name: 'Disney', color: '#006EC5' },
  ];
};