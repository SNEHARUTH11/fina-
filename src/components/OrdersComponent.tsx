import React from 'react';
import { Clock, Check, X } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { Asset, Order } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface OrdersComponentProps {
  assets: Asset[];
}

const OrdersComponent: React.FC<OrdersComponentProps> = ({ assets }) => {
  const { orders, cancelOrder } = useOrderStore();
  
  // Get asset symbol by ID
  const getAssetSymbol = (assetId: string): string => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.symbol : 'Unknown';
  };
  
  // Format timestamp
  const formatTime = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  // Filter out old orders
  const activeOrders = orders.filter(order => order.status !== 'canceled');
  const pendingOrders = activeOrders.filter(order => order.status === 'pending');
  
  // Sort orders by most recent first
  const sortedOrders = [...activeOrders].sort((a, b) => b.createdAt - a.createdAt);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold flex items-center justify-between">
          <span>Orders</span>
          {pendingOrders.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
              {pendingOrders.length} pending
            </span>
          )}
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        {sortedOrders.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No orders placed yet
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Asset
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Side
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Time
                </th>
                <th className="relative px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {sortedOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium">
                      {getAssetSymbol(order.assetId)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="capitalize">{order.type}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.side === 'buy' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {order.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    ${order.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {order.amount.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`flex items-center ${
                      order.status === 'filled' 
                        ? 'text-green-600' 
                        : order.status === 'canceled' 
                        ? 'text-gray-500' 
                        : 'text-blue-600'
                    }`}>
                      {order.status === 'filled' ? (
                        <Check size={16} className="mr-1" />
                      ) : order.status === 'canceled' ? (
                        <X size={16} className="mr-1" />
                      ) : (
                        <Clock size={16} className="mr-1" />
                      )}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrdersComponent;