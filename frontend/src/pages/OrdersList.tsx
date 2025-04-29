import React, { useState, useEffect } from "react";
import { ListFilter, RefreshCw, DownloadCloud, Grid, List } from "lucide-react";
import OrderTable from "../components/OrderTable";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { fetchOrders, updateOrderStatus } from "../services/api";
import { Order, OrderStatus, OrderFilters } from "../types";

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState<OrderFilters>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders(filters);
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(id, status);
      setOrders(
        orders.map((order) => (order._id === id ? updatedOrder : order))
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;
    setFilters((prev) => ({ ...prev, searchQuery }));
  };

  const handleStatusFilter = (status: OrderStatus, checked: boolean) => {
    setFilters((prev) => {
      const currentStatuses = prev.status || [];
      if (checked) {
        return { ...prev, status: [...currentStatuses, status] };
      } else {
        return { ...prev, status: currentStatuses.filter((s) => s !== status) };
      }
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ListFilter className="mr-2 h-4 w-4" />
            Filters
          </button>

          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`p-2 ${
                view === "list"
                  ? "bg-gray-200 text-gray-800"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-2 ${
                view === "grid"
                  ? "bg-gray-200 text-gray-800"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={loadOrders}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <DownloadCloud className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <input
                type="text"
                id="search"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Order #, customer, email..."
                value={filters.searchQuery || ""}
                onChange={handleSearch}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="space-y-2">
                {(
                  [
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ] as OrderStatus[]
                ).map((status) => (
                  <div key={status} className="flex items-center">
                    <input
                      id={`status-${status}`}
                      name={`status-${status}`}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={(filters.status || []).includes(status)}
                      onChange={(e) =>
                        handleStatusFilter(status, e.target.checked)
                      }
                    />
                    <label
                      htmlFor={`status-${status}`}
                      className="ml-2 block text-sm text-gray-700"
                    >
                      <OrderStatusBadge status={status} />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Content */}
      {view === "list" ? (
        <OrderTable
          orders={orders}
          loading={loading}
          onRefresh={loadOrders}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-5 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900">
                      {order.orderNumber}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.customer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.customer.email}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">
                      Date:{" "}
                      <span className="text-gray-900">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </div>
                </div>
                <div className="border-t border-gray-200 px-5 py-3 bg-gray-50">
                  <button
                    onClick={() =>
                      (window.location.href = `dashboard/orders/${order._id}`)
                    }
                    className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersList;
