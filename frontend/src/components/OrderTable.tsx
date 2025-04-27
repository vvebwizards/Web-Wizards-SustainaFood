import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Filter,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Truck,
  Calendar,
} from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import DeliveryModal from "./DeliveryModal";
import { Order, OrderStatus } from "../types";
import { scheduleDelivery } from "../services/api";

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onStatusChange?: (id: string, status: OrderStatus) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  loading,
  onRefresh,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<keyof Order>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [schedulingDelivery, setSchedulingDelivery] = useState(false);

  const handleSort = (field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleActionMenu = (orderId: string) => {
    setActionMenuOpen(actionMenuOpen === orderId ? null : orderId);
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/dashboard/orders/${orderId}`);
  };

  const handleScheduleDelivery = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDeliveryModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleDeliverySubmit = async (data: {
    method: string;
    date: string;
    time: string;
    notes: string;
  }) => {
    if (!selectedOrderId) return;

    try {
      setSchedulingDelivery(true);
      await scheduleDelivery(selectedOrderId, data);
      onRefresh(); // Refresh the orders list
      setDeliveryModalOpen(false);
      setSelectedOrderId(null);
    } catch (error) {
      console.error("Error scheduling delivery:", error);
      // Here you might want to show an error message to the user
    } finally {
      setSchedulingDelivery(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Orders</h2>
          <div className="flex space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-1.5" />
              Filter
            </button>
            <button
              onClick={onRefresh}
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("orderNumber")}
                >
                  <div className="flex items-center">
                    Order Number
                    {sortField === "orderNumber" && (
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("customer")}
                >
                  <div className="flex items-center">Customer</div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === "status" && (
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("totalAmount")}
                >
                  <div className="flex items-center">
                    Total
                    {sortField === "totalAmount" && (
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Date
                    {sortField === "createdAt" && (
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                    <span className="mt-2 block">Loading orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewOrder(order._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      {order.delivery?.trackingNumber && (
                        <div className="text-xs text-gray-500">
                          Tracking: {order.delivery.trackingNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActionMenu(order._id);
                        }}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {actionMenuOpen === order._id && (
                        <div
                          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            <button
                              onClick={() => handleViewOrder(order._id)}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                // Implement edit functionality
                                setActionMenuOpen(null);
                              }}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Order
                            </button>
                            <button
                              onClick={() => handleScheduleDelivery(order._id)}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Delivery
                            </button>
                            {order.status !== "shipped" &&
                              order.status !== "delivered" && (
                                <button
                                  onClick={() => {
                                    onStatusChange?.(order._id, "shipped");
                                    setActionMenuOpen(null);
                                  }}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Truck className="h-4 w-4 mr-2" />
                                  Mark as Shipped
                                </button>
                              )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{orders.length}</span>{" "}
              orders
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled
              >
                Previous
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeliveryModal
        isOpen={deliveryModalOpen}
        onClose={() => {
          setDeliveryModalOpen(false);
          setSelectedOrderId(null);
        }}
        onSubmit={handleDeliverySubmit}
        loading={schedulingDelivery}
      />
    </>
  );
};

export default OrderTable;
