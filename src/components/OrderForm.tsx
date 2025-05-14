import React, { useState } from 'react';
import { DollarSign, ShoppingCart } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { Asset } from '../types';

interface OrderFormProps {
  asset: Asset;
  currentPrice: number;
}

const OrderForm: React.FC<OrderFormProps> = ({ asset, currentPrice }) => {
  const { placeOrder, balance } = useOrderStore();
  const [type, setType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState<string>(currentPrice.toFixed(2));
  const [amount, setAmount] = useState<string>('0.1');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderPrice = type === 'market' ? currentPrice : parseFloat(price);
    const orderAmount = parseFloat(amount);
    
    if (isNaN(orderPrice) || orderPrice <= 0 || isNaN(orderAmount) || orderAmount <= 0) {
      return;
    }
    
    placeOrder({
      assetId: asset.id,
      type,
      side,
      price: orderPrice,
      amount: orderAmount,
    });
    
    // Reset form
    if (type === 'limit') {
      setPrice(currentPrice.toFixed(2));
    }
    setAmount('0.1');
  };
  
  // Calculate order total
  const orderTotal = parseFloat(price) * parseFloat(amount || '0');
  const canAfford = side === 'sell' || (orderTotal <= balance);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold flex items-center">
          <ShoppingCart size={18} className="mr-2" />
          Place Order
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Order Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order Type
            </label>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setType('market')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md focus:outline-none ${
                  type === 'market'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Market
              </button>
              <button
                type="button"
                onClick={() => setType('limit')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none ${
                  type === 'limit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Limit
              </button>
            </div>
          </div>
          
          {/* Buy/Sell Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Side
            </label>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setSide('buy')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md focus:outline-none ${
                  side === 'buy'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setSide('sell')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none ${
                  side === 'sell'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Sell
              </button>
            </div>
          </div>
          
          {/* Price Input (for Limit Orders) */}
          {type === 'limit' && (
            <div>
              <label htmlFor="limitPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Limit Price
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  id="limitPrice"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          )}
          
          {/* Amount Input */}
          <div>
            <label htmlFor="orderAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              id="orderAmount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          {/* Order Summary */}
          <div className="bg-gray-50 p-3 rounded-md dark:bg-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Estimated Total:</span>
              <span className="font-medium">${orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500 dark:text-gray-400">Available Balance:</span>
              <span className={`font-medium ${!canAfford && side === 'buy' ? 'text-red-500' : ''}`}>
                ${balance.toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canAfford}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${side === 'buy' 
                ? canAfford ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'} 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {side === 'buy' ? 'Buy' : 'Sell'} {asset.symbol}
          </button>
          
          {!canAfford && side === 'buy' && (
            <p className="text-xs text-red-500 text-center">
              Insufficient balance for this order
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default OrderForm;