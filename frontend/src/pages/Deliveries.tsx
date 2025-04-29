import React, { useState, useEffect } from 'react';
import { Truck, Calendar, MapPin, Search, Filter } from 'lucide-react';
import DeliveriesList from '../components/DeliveriesList';
import { fetchOrders } from '../services/api';
import { Order } from '../types';

const Deliveries: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'standard' | 'express'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders
    .filter(order => order.delivery) // Only show orders with delivery info
    .filter(order => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query)
      );
    })
    .filter(order => {
      if (filterMethod === 'all') return true;
      return order.delivery.method === filterMethod;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search deliveries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value as 'all' | 'standard' | 'express')}
            className="block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Methods</option>
            <option value="standard">Standard Delivery</option>
            <option value="express">Express Delivery</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Truck className="mx-auto h-12 w-12 text-gray-400 animate-bounce" />
          <p className="mt-2 text-gray-500">Loading deliveries...</p>
        </div>
      ) : (
        <DeliveriesList orders={filteredOrders} />
      )}
    </div>
  );
};

export default Deliveries;