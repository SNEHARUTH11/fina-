import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData as LightweightChartsCandlestickData } from 'lightweight-charts';
import { CandlestickData, Asset, CandlePattern } from '../types';

interface ChartComponentProps {
  data: CandlestickData[];
  asset: Asset;
  patterns: CandlePattern[];
  height?: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ 
  data, 
  asset, 
  patterns,
  height = 400 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#d9d9d9',
      },
      grid: {
        vertLines: { color: '#1e222d' },
        horzLines: { color: '#1e222d' },
      },
      width: chartContainerRef.current.clientWidth,
      height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    
    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    
    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Set as an overlay by using empty string
    });
    
    // Set data
    if (data.length > 0) {
      const formattedData = data.map(candle => ({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));
      
      const volumeData = data.map(candle => ({
        time: candle.time,
        value: candle.volume,
        color: candle.close >= candle.open ? '#26a69a80' : '#ef535080',
      }));
      
      candlestickSeries.setData(formattedData);
      volumeSeries.setData(volumeData);
      
      // Fit content
      chart.timeScale().fitContent();
    }
    
    // Store refs
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;
    
    // Cleanup
    return () => {
      chart.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [height]);
  
  // Update data when it changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || data.length === 0) return;
    
    const formattedData = data.map(candle => ({
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
    
    const volumeData = data.map(candle => ({
      time: candle.time,
      value: candle.volume,
      color: candle.close >= candle.open ? '#26a69a80' : '#ef535080',
    }));
    
    candlestickSeriesRef.current.setData(formattedData);
    volumeSeriesRef.current.setData(volumeData);
    
    // Mark patterns on the chart
    if (patterns.length > 0 && chartRef.current) {
      // Remove old markers first
      chartRef.current.timeScale().fitContent();
    }
  }, [data, patterns]);
  
  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="relative w-full">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-xl font-bold text-white">
          {asset.name} ({asset.symbol})
        </h3>
      </div>
      <div 
        ref={chartContainerRef} 
        className="w-full rounded-lg overflow-hidden"
      />
      {patterns.length > 0 && (
        <div className="mt-2 space-y-1">
          {patterns.map((pattern, index) => (
            <div 
              key={`${pattern.name}-${index}`}
              className={`text-sm px-2 py-1 rounded-md inline-block mr-2 ${
                pattern.significance === 'bullish'
                  ? 'bg-green-100 text-green-800'
                  : pattern.significance === 'bearish'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <span className="font-medium">{pattern.name}</span> - {pattern.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartComponent;