import React, { useEffect, useState } from 'react';
import ChartComponent from './components/ChartComponent';
import WatchlistComponent from './components/WatchlistComponent';
import AlertComponent from './components/AlertComponent';
import OrderForm from './components/OrderForm';
import PortfolioComponent from './components/PortfolioComponent';
import OrdersComponent from './components/OrdersComponent';
import TradingBotComponent from './components/TradingBotComponent';
import TimeframeSelector from './components/TimeframeSelector';
import NotificationToast from './components/NotificationToast';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ScrollToTop';
import MarketOverview from './components/MarketOverview';
import ThemeToggle from './components/ThemeToggle';
import { Element, scroller } from 'react-scroll';
import { useAssetStore } from './store/useAssetStore';
import { useOrderStore } from './store/useOrderStore';
import { useTradingBotStore } from './store/useTradingBotStore';
import { useAuthStore } from './store/useAuthStore';
import { LogIn, LogOut, Menu, X } from 'lucide-react';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  
  const { 
    assets, 
    selectedAssetId, 
    timeFrame,
    candleData, 
    patterns,
    selectAsset, 
    setTimeFrame,
    updateCandles,
    initializeData,
  } = useAssetStore();
  
  const { processOrders } = useOrderStore();
  const { runTradingBot } = useTradingBotStore();

  useEffect(() => {
    if (user) {
      initializeData();
    }
  }, [user, initializeData]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      updateCandles();
    }, 1000);
    return () => clearInterval(interval);
  }, [user, updateCandles]);
  
  useEffect(() => {
    if (selectedAssetId && candleData[selectedAssetId]) {
      const latestCandle = candleData[selectedAssetId][candleData[selectedAssetId].length - 1];
      processOrders(selectedAssetId, latestCandle.close);
      runTradingBot(selectedAssetId);
    }
  }, [candleData, selectedAssetId, processOrders, runTradingBot]);
  
  const getCurrentPrices = (): Record<string, number> => {
    const prices: Record<string, number> = {};
    assets.forEach(asset => {
      const assetData = candleData[asset.id];
      if (assetData && assetData.length > 0) {
        prices[asset.id] = assetData[assetData.length - 1].close;
      }
    });
    return prices;
  };
  
  const getSelectedAssetPrice = (): number => {
    if (!selectedAssetId || !candleData[selectedAssetId]) return 0;
    const data = candleData[selectedAssetId];
    return data[data.length - 1].close;
  };
  
  const selectedAsset = assets.find(asset => asset.id === selectedAssetId);

  const scrollToSection = (section: string) => {
    setIsMobileMenuOpen(false);
    scroller.scrollTo(section, {
      duration: 800,
      smooth: true,
      offset: -80
    });
  };

  const navigationItems = [
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'market', label: 'Market' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'orders', label: 'Orders' },
    { id: 'trading-bot', label: 'Bot' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-groww-background-light dark:bg-groww-background-dark">
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-groww-background-light dark:bg-groww-background-dark">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      <NotificationToast assets={assets} prices={getCurrentPrices()} />
      
      <header className="fixed top-0 left-0 right-0 bg-groww-card-light dark:bg-groww-card-dark border-b border-groww-border-light dark:border-groww-border-dark shadow-groww z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-groww-blue">
                TradeSim
              </h1>
            </div>

            <nav className="hidden md:flex space-x-8">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-groww-gray dark:text-groww-light hover:text-groww-blue transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={signOut}
                className="button-3d px-4 py-2 rounded-lg"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-groww-gray dark:text-groww-light hover:text-groww-blue"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-groww-gray dark:text-groww-light hover:text-groww-blue"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <Element name="market" className="mb-8">
          <MarketOverview assets={assets} candleData={candleData} />
        </Element>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Element name="watchlist">
              <WatchlistComponent 
                assets={assets}
                candleData={candleData}
                onSelectAsset={selectAsset}
                selectedAssetId={selectedAssetId}
              />
            </Element>
            
            {selectedAsset && (
              <Element name="alerts">
                <AlertComponent 
                  asset={selectedAsset}
                  currentPrice={getSelectedAssetPrice()}
                />
              </Element>
            )}
            
            {selectedAsset && (
              <Element name="order-form">
                <OrderForm 
                  asset={selectedAsset}
                  currentPrice={getSelectedAssetPrice()}
                />
              </Element>
            )}
          </div>
          
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {selectedAsset && candleData[selectedAssetId] && (
              <>
                <Element name="chart">
                  <ChartComponent 
                    data={candleData[selectedAssetId]} 
                    asset={selectedAsset}
                    patterns={patterns[selectedAssetId] || []}
                    height={500}
                  />
                </Element>
                
                <Element name="timeframe">
                  <TimeframeSelector 
                    timeFrame={timeFrame}
                    onChange={setTimeFrame}
                  />
                </Element>
              </>
            )}
          </div>
          
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Element name="portfolio">
              <PortfolioComponent 
                assets={assets}
                currentPrices={getCurrentPrices()}
              />
            </Element>
            
            <Element name="orders">
              <OrdersComponent assets={assets} />
            </Element>
            
            {selectedAsset && (
              <Element name="trading-bot">
                <TradingBotComponent asset={selectedAsset} />
              </Element>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-groww-card-light dark:bg-groww-card-dark border-t border-groww-border-light dark:border-groww-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About TradeSim</h3>
              <p className="text-sm text-groww-gray dark:text-groww-light">
                A realistic trading platform simulator for learning and practicing trading strategies without financial risk.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-groww-gray dark:text-groww-light">
                <li>Real-time market simulation</li>
                <li>Advanced charting tools</li>
                <li>Automated trading bots</li>
                <li>Portfolio management</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Disclaimer</h3>
              <p className="text-sm text-groww-gray dark:text-groww-light">
                This is a simulation platform. All market data and trading activities are simulated for educational purposes only.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-groww-border-light dark:border-groww-border-dark text-center text-sm text-groww-gray dark:text-groww-light">
            © {new Date().getFullYear()} TradeSim. All rights reserved.
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
}

export default App;