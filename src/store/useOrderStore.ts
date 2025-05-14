import { create } from 'zustand';
import { Order, PortfolioHolding } from '../types';

interface OrderState {
  orders: Order[];
  portfolio: PortfolioHolding[];
  balance: number;
  // Actions
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt' | 'filledAt'>) => void;
  cancelOrder: (orderId: string) => void;
  processOrders: (assetId: string, currentPrice: number) => void;
}

// Initial balance for demo purposes
const INITIAL_BALANCE = 10000;

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  portfolio: [],
  balance: INITIAL_BALANCE,
  
  placeOrder: (orderData) => {
    const { balance, portfolio } = get();
    const order: Order = {
      ...orderData,
      id: Math.random().toString(36).substring(2, 15),
      status: orderData.type === 'market' ? 'filled' : 'pending',
      createdAt: Date.now(),
      filledAt: orderData.type === 'market' ? Date.now() : undefined
    };
    
    // For market orders, process immediately
    if (order.type === 'market') {
      const cost = order.price * order.amount;
      
      if (order.side === 'buy') {
        // Check if user has enough balance
        if (cost > balance) {
          console.error('Insufficient balance for this order');
          return;
        }
        
        // Update balance and portfolio
        set(state => {
          // Find existing holding or create new one
          const existingHoldingIndex = state.portfolio.findIndex(h => h.assetId === order.assetId);
          let updatedPortfolio = [...state.portfolio];
          
          if (existingHoldingIndex >= 0) {
            // Update existing holding
            const existingHolding = state.portfolio[existingHoldingIndex];
            const newAmount = existingHolding.amount + order.amount;
            const newAvgPrice = (existingHolding.averagePrice * existingHolding.amount + cost) / newAmount;
            
            updatedPortfolio[existingHoldingIndex] = {
              ...existingHolding,
              amount: newAmount,
              averagePrice: newAvgPrice
            };
          } else {
            // Add new holding
            updatedPortfolio.push({
              assetId: order.assetId,
              amount: order.amount,
              averagePrice: order.price
            });
          }
          
          return {
            orders: [...state.orders, order],
            portfolio: updatedPortfolio,
            balance: state.balance - cost
          };
        });
      } else if (order.side === 'sell') {
        // Find existing holding
        const holding = get().portfolio.find(h => h.assetId === order.assetId);
        
        // Check if user has enough assets to sell
        if (!holding || holding.amount < order.amount) {
          console.error('Insufficient assets for this order');
          return;
        }
        
        // Update balance and portfolio
        set(state => {
          const holdingIndex = state.portfolio.findIndex(h => h.assetId === order.assetId);
          let updatedPortfolio = [...state.portfolio];
          const holding = updatedPortfolio[holdingIndex];
          
          if (holding.amount === order.amount) {
            // Remove holding completely
            updatedPortfolio = updatedPortfolio.filter((_, i) => i !== holdingIndex);
          } else {
            // Update holding amount
            updatedPortfolio[holdingIndex] = {
              ...holding,
              amount: holding.amount - order.amount
            };
          }
          
          return {
            orders: [...state.orders, order],
            portfolio: updatedPortfolio,
            balance: state.balance + cost
          };
        });
      }
    } else {
      // For limit orders, just add to the orders list
      set(state => ({
        orders: [...state.orders, order]
      }));
    }
  },
  
  cancelOrder: (orderId) => {
    set(state => ({
      orders: state.orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'canceled' } 
          : order
      )
    }));
  },
  
  processOrders: (assetId, currentPrice) => {
    const { orders, balance, portfolio } = get();
    let updatedOrders = [...orders];
    let updatedBalance = balance;
    let updatedPortfolio = [...portfolio];
    
    // Process only pending limit orders for this asset
    orders
      .filter(order => 
        order.assetId === assetId && 
        order.status === 'pending' &&
        order.type === 'limit'
      )
      .forEach(order => {
        const shouldFill = 
          (order.side === 'buy' && currentPrice <= order.price) ||
          (order.side === 'sell' && currentPrice >= order.price);
        
        if (shouldFill) {
          // Mark order as filled
          const orderIndex = updatedOrders.findIndex(o => o.id === order.id);
          updatedOrders[orderIndex] = {
            ...order,
            status: 'filled',
            filledAt: Date.now()
          };
          
          const cost = order.price * order.amount;
          
          if (order.side === 'buy') {
            // Check if user has enough balance
            if (cost > updatedBalance) {
              // Skip this order if not enough balance
              return;
            }
            
            // Update balance
            updatedBalance -= cost;
            
            // Update portfolio
            const existingHoldingIndex = updatedPortfolio.findIndex(h => h.assetId === order.assetId);
            
            if (existingHoldingIndex >= 0) {
              // Update existing holding
              const existingHolding = updatedPortfolio[existingHoldingIndex];
              const newAmount = existingHolding.amount + order.amount;
              const newAvgPrice = (existingHolding.averagePrice * existingHolding.amount + cost) / newAmount;
              
              updatedPortfolio[existingHoldingIndex] = {
                ...existingHolding,
                amount: newAmount,
                averagePrice: newAvgPrice
              };
            } else {
              // Add new holding
              updatedPortfolio.push({
                assetId: order.assetId,
                amount: order.amount,
                averagePrice: order.price
              });
            }
          } else if (order.side === 'sell') {
            // Find existing holding
            const holdingIndex = updatedPortfolio.findIndex(h => h.assetId === order.assetId);
            
            // Skip if no holding or not enough to sell
            if (holdingIndex < 0 || updatedPortfolio[holdingIndex].amount < order.amount) {
              return;
            }
            
            // Update balance
            updatedBalance += cost;
            
            // Update portfolio
            const holding = updatedPortfolio[holdingIndex];
            
            if (holding.amount === order.amount) {
              // Remove holding completely
              updatedPortfolio = updatedPortfolio.filter((_, i) => i !== holdingIndex);
            } else {
              // Update holding amount
              updatedPortfolio[holdingIndex] = {
                ...holding,
                amount: holding.amount - order.amount
              };
            }
          }
        }
      });
    
    set({
      orders: updatedOrders,
      balance: updatedBalance,
      portfolio: updatedPortfolio
    });
  }
}));