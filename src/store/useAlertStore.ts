import { create } from 'zustand';
import { PriceAlert } from '../types';

interface AlertState {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'triggered' | 'createdAt'>) => void;
  removeAlert: (alertId: string) => void;
  checkAlerts: (assetId: string, currentPrice: number) => PriceAlert[];
  markAlertAsTriggered: (alertId: string) => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  
  addAlert: (alertData) => {
    const newAlert: PriceAlert = {
      ...alertData,
      id: Math.random().toString(36).substring(2, 15),
      triggered: false,
      createdAt: Date.now()
    };
    
    set(state => ({
      alerts: [...state.alerts, newAlert]
    }));
  },
  
  removeAlert: (alertId) => {
    set(state => ({
      alerts: state.alerts.filter(alert => alert.id !== alertId)
    }));
  },
  
  checkAlerts: (assetId, currentPrice) => {
    const { alerts } = get();
    const triggeredAlerts: PriceAlert[] = [];
    
    alerts
      .filter(alert => alert.assetId === assetId && !alert.triggered)
      .forEach(alert => {
        if (
          (alert.condition === 'above' && currentPrice >= alert.price) ||
          (alert.condition === 'below' && currentPrice <= alert.price)
        ) {
          triggeredAlerts.push(alert);
        }
      });
    
    return triggeredAlerts;
  },
  
  markAlertAsTriggered: (alertId) => {
    set(state => ({
      alerts: state.alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, triggered: true } 
          : alert
      )
    }));
  }
}));