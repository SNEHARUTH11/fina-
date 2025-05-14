import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAlertStore } from '../store/useAlertStore';
import { toast } from 'react-toastify';
import { Asset } from '../types';

interface NotificationToastProps {
  assets: Asset[];
  prices: Record<string, number>;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ 
  assets, 
  prices 
}) => {
  const { alerts, checkAlerts, markAlertAsTriggered } = useAlertStore();
  const [lastChecked, setLastChecked] = useState<Record<string, number>>({});
  
  // Get asset name by ID
  const getAssetName = (assetId: string): string => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.symbol : 'Unknown';
  };
  
  // Check for triggered alerts
  useEffect(() => {
    Object.entries(prices).forEach(([assetId, price]) => {
      if (lastChecked[assetId] === price) return;
      
      // Check alerts for this asset
      const triggeredAlerts = checkAlerts(assetId, price);
      
      // Show notifications for triggered alerts
      triggeredAlerts.forEach(alert => {
        toast.info(
          `Price Alert: ${getAssetName(alert.assetId)} is now ${alert.condition === 'above' ? 'above' : 'below'} $${alert.price.toFixed(2)}`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        
        // Mark alert as triggered
        markAlertAsTriggered(alert.id);
      });
      
      // Update last checked price
      setLastChecked(prev => ({
        ...prev,
        [assetId]: price
      }));
    });
  }, [prices, alerts, checkAlerts, markAlertAsTriggered, getAssetName, lastChecked]);
  
  return <ToastContainer />;
};

export default NotificationToast;