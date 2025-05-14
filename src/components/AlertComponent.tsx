import React, { useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { useAlertStore } from '../store/useAlertStore';
import { Asset } from '../types';

interface AlertComponentProps {
  asset: Asset;
  currentPrice: number;
}

const AlertComponent: React.FC<AlertComponentProps> = ({ asset, currentPrice }) => {
  const { alerts, addAlert, removeAlert } = useAlertStore();
  const [price, setPrice] = useState<string>(currentPrice.toFixed(2));
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  
  // Filter alerts for current asset
  const assetAlerts = alerts.filter(alert => alert.assetId === asset.id);
  
  // Handle alert creation
  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    
    const alertPrice = parseFloat(price);
    if (isNaN(alertPrice) || alertPrice <= 0) return;
    
    addAlert({
      assetId: asset.id,
      price: alertPrice,
      condition: condition
    });
    
    // Reset form
    setPrice(currentPrice.toFixed(2));
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold flex items-center">
          <Bell size={18} className="mr-2" />
          Price Alerts
        </h2>
      </div>
      
      <form onSubmit={handleCreateAlert} className="p-4 border-b dark:border-gray-700">
        <div className="flex flex-col space-y-3">
          <div>
            <label htmlFor="alertPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alert Price
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                id="alertPrice"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Condition
            </label>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setCondition('above')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md focus:outline-none ${
                  condition === 'above'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Above
              </button>
              <button
                type="button"
                onClick={() => setCondition('below')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none ${
                  condition === 'below'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Below
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Alert
          </button>
        </div>
      </form>
      
      <div className="p-4">
        {assetAlerts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            No alerts set for {asset.name}
          </p>
        ) : (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Alerts
            </h3>
            {assetAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-3 rounded-md flex justify-between items-center text-sm ${
                  alert.triggered 
                    ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' 
                    : alert.condition === 'above'
                    ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                <div>
                  <div className="font-medium">
                    {alert.condition === 'above' ? 'Above' : 'Below'} ${alert.price.toFixed(2)}
                  </div>
                  <div className="text-xs opacity-70">
                    {alert.triggered 
                      ? 'Triggered' 
                      : `Current: $${currentPrice.toFixed(2)}`}
                  </div>
                </div>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertComponent;