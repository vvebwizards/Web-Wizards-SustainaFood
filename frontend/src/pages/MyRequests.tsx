import React, { useEffect, useState } from "react";
import { MapPin, PackageCheck, Clock, ClipboardList, ChevronDown, ChevronUp, Package } from "lucide-react";
import { Order, OrderItem } from "../types";
import { roleConfigs } from "../utils/roleConfigs";

const MyRequests: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("📦 Fetching orders for the authenticated user");
        const response = await fetch(`http://localhost:5000/api/orders/my`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data: Order[] = await response.json();
        setOrders(data);
        console.log("✅ Orders fetched:", data);
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return {
          badge: "bg-teal-100 text-teal-800",
          icon: "bg-teal-100 text-teal-600",
        };
      case "pending":
      default:
        return {
          badge: "bg-amber-100 text-amber-800",
          icon: "bg-amber-100 text-amber-600",
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  const parseLocation = (location: any) => {
  if (typeof location === "string") {
    const [lat, lon] = location.split(",").map(Number);
    return { latitude: lat, longitude: lon };
  }
  return location;
};


  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pt-8">
      <h2 className={`text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 ${roleConfigs.recipient.theme.colors.text}`}>
        <ClipboardList className={`w-6 h-6 ${roleConfigs.recipient.theme.colors.text}`} />
        <span>My Requests</span>
      </h2>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Filter by status:
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} requests
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="flex justify-center mb-4">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No requests found</h3>
          <p className="text-gray-500">
            {filterStatus === "all"
              ? "You haven't made any requests yet."
              : `You don't have any ${filterStatus} requests.`}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {filteredOrders.map((order) => {
            const statusStyles = getStatusStyles(order.status);
            return (
              <li
                key={order._id}
                className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full flex-shrink-0 ${statusStyles.icon}`}>
                        <PackageCheck className="w-5 h-5" />
                      </div>

                      <div>
                        <h3 className="text-md font-semibold text-gray-800 mb-1">
                          Order {order.orderNumber}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              {parseLocation(order.location).latitude.toFixed(5)}, {parseLocation(order.location).longitude.toFixed(5)}

                            </span>
                          </p>
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state}, {order.shippingAddress.zipCode},{" "}
                              {order.shippingAddress.country}
                            </span>
                          </p>
                          <p className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDate(order.createdAt)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full flex items-center justify-center min-w-[90px] ${statusStyles.badge}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>

                    <button
                      onClick={() => setExpandedOrderId((prev) => (prev === order._id ? null : order._id))}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                      aria-expanded={expandedOrderId === order._id}
                    >
                      {expandedOrderId === order._id ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>Details</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedOrderId === order._id ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-700 mb-3">Items:</h4>
                    <ul className="space-y-3">
                      {order.items.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-4 bg-gray-50 p-3 rounded-md border border-gray-200 transition-all duration-200"
                        >
                          {item.imageUrl ? (
                            <img
                              src={`http://localhost:5000${item.imageUrl}`}
                              alt={item.title || item.name || "Product image"}
                              className="w-16 h-16 object-cover rounded-md shadow-sm"
                              onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-md text-gray-500 text-xs">
                              No Image
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {item.title || item.name || "Untitled item"}
                            </p>
                            <p className="text-xs text-gray-600">
                              Product ID: {item.productId}
                            </p>
                            <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Qty: {item.orderedQuantity}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MyRequests;