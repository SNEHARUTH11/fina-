import { CandlestickData, CandlePattern } from '../types';

/**
 * Check for Doji pattern - open and close are very close
 */
const isDoji = (candle: CandlestickData): boolean => {
  const bodySize = Math.abs(candle.open - candle.close);
  const totalRange = candle.high - candle.low;
  
  // Body is less than 10% of the total range
  return bodySize / totalRange < 0.1;
};

/**
 * Check for Hammer pattern - small body, long lower shadow, small upper shadow
 */
const isHammer = (candle: CandlestickData): boolean => {
  const bodySize = Math.abs(candle.open - candle.close);
  const totalRange = candle.high - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  
  // Body is less than 30% of total range
  const smallBody = bodySize / totalRange < 0.3;
  // Lower shadow is at least 2x the body size
  const longLowerShadow = lowerShadow > bodySize * 2;
  // Upper shadow is less than 10% of total range
  const smallUpperShadow = upperShadow / totalRange < 0.1;
  
  return smallBody && longLowerShadow && smallUpperShadow;
};

/**
 * Check for Shooting Star pattern - small body, long upper shadow, small lower shadow
 */
const isShootingStar = (candle: CandlestickData): boolean => {
  const bodySize = Math.abs(candle.open - candle.close);
  const totalRange = candle.high - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  
  // Body is less than 30% of total range
  const smallBody = bodySize / totalRange < 0.3;
  // Upper shadow is at least 2x the body size
  const longUpperShadow = upperShadow > bodySize * 2;
  // Lower shadow is less than 10% of total range
  const smallLowerShadow = lowerShadow / totalRange < 0.1;
  
  return smallBody && longUpperShadow && smallLowerShadow;
};

/**
 * Check for Bullish Engulfing pattern
 */
const isBullishEngulfing = (previous: CandlestickData, current: CandlestickData): boolean => {
  // Previous candle is bearish (close < open)
  const previousBearish = previous.close < previous.open;
  // Current candle is bullish (close > open)
  const currentBullish = current.close > current.open;
  // Current candle's body engulfs previous candle's body
  const engulfingBody = current.open < previous.close && current.close > previous.open;
  
  return previousBearish && currentBullish && engulfingBody;
};

/**
 * Check for Bearish Engulfing pattern
 */
const isBearishEngulfing = (previous: CandlestickData, current: CandlestickData): boolean => {
  // Previous candle is bullish (close > open)
  const previousBullish = previous.close > previous.open;
  // Current candle is bearish (close < open)
  const currentBearish = current.close < current.open;
  // Current candle's body engulfs previous candle's body
  const engulfingBody = current.open > previous.close && current.close < previous.open;
  
  return previousBullish && currentBearish && engulfingBody;
};

/**
 * Detect patterns in candlestick data
 */
export const detectPatterns = (candles: CandlestickData[]): CandlePattern[] => {
  if (candles.length < 2) return [];
  
  const patterns: CandlePattern[] = [];
  
  // Check single-candle patterns for the most recent candle
  const latestCandle = candles[candles.length - 1];
  const previousCandle = candles[candles.length - 2];
  
  // Check for Doji
  if (isDoji(latestCandle)) {
    patterns.push({
      name: 'Doji',
      description: 'Indicates indecision in the market, potential reversal signal.',
      time: latestCandle.time,
      significance: 'neutral'
    });
  }
  
  // Check for Hammer
  if (isHammer(latestCandle)) {
    patterns.push({
      name: 'Hammer',
      description: 'Potential bullish reversal pattern after a downtrend.',
      time: latestCandle.time,
      significance: 'bullish'
    });
  }
  
  // Check for Shooting Star
  if (isShootingStar(latestCandle)) {
    patterns.push({
      name: 'Shooting Star',
      description: 'Potential bearish reversal pattern after an uptrend.',
      time: latestCandle.time,
      significance: 'bearish'
    });
  }
  
  // Check for Bullish Engulfing
  if (isBullishEngulfing(previousCandle, latestCandle)) {
    patterns.push({
      name: 'Bullish Engulfing',
      description: 'Strong bullish reversal pattern showing buyers taking control.',
      time: latestCandle.time,
      significance: 'bullish'
    });
  }
  
  // Check for Bearish Engulfing
  if (isBearishEngulfing(previousCandle, latestCandle)) {
    patterns.push({
      name: 'Bearish Engulfing',
      description: 'Strong bearish reversal pattern showing sellers taking control.',
      time: latestCandle.time,
      significance: 'bearish'
    });
  }
  
  return patterns;
};