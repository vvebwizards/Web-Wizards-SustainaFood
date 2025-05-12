import React from 'react';
import { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { color: string; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
  packed: { color: 'bg-indigo-100 text-indigo-800', label: 'Packed' },
  shipped: { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
  delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  returned: { color: 'bg-gray-100 text-gray-800', label: 'Returned' }
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const { color, label } = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

export default OrderStatusBadge;