import { Order, OrderStats, OrderFilters } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchOrders = async (filters?: OrderFilters): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    const orders = await response.json();
    
    // Apply client-side filters if provided
    if (!filters) return orders;
    
    let filteredOrders = [...orders];
    
    if (filters.status && filters.status.length > 0) {
      filteredOrders = filteredOrders.filter(order => 
        filters.status?.includes(order.status)
      );
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query)
      );
    }
    
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start).getTime();
      const end = new Date(filters.dateRange.end).getTime();
      
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt).getTime();
        return orderDate >= start && orderDate <= end;
      });
    }
    
    // Sort
    if (filters.sortBy) {
      filteredOrders.sort((a, b) => {
        let aValue: any = a[filters.sortBy as keyof Order];
        let bValue: any = b[filters.sortBy as keyof Order];
        
        if (typeof aValue === 'object' && aValue !== null) {
          aValue = JSON.stringify(aValue);
          bValue = JSON.stringify(bValue);
        }
        
        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filteredOrders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const fetchOrder = async (id: string): Promise<Order | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch order');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

export const fetchOrderStats = async (): Promise<OrderStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/stats/overview`);
    if (!response.ok) throw new Error('Failed to fetch order stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) throw new Error('Failed to update order status');
    return await response.json();
  } catch (error) {
    console.error(`Error updating order ${id} status:`, error);
    throw error;
  }
};

export const scheduleDelivery = async (
  id: string,
  data: {
    method: string;
    date: string;
    time: string;
    notes: string;
  }
): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/delivery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to schedule delivery');
    return await response.json();
  } catch (error) {
    console.error(`Error scheduling delivery for order ${id}:`, error);
    throw error;
  }
};