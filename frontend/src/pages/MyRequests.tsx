import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MapPin, PackageCheck, Clock, ClipboardList, Eye } from "lucide-react";

interface OrderItem {
  productId: string;  // Just the ID
  name: string;
  orderedQuantity: number;
  imageUrl?: string;
  title?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  recipientId: string;
  location: string;
  status: string;
  createdAt: string;
}

const MyRequests: React.FC = () => {
  const { user } = useAuth();
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

  if (loading)
    return <div className="p-6 text-center">Loading your requests...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-blue-600" /> My Requests
      </h2>

      <div className="mb-6">
        <label
          htmlFor="status"
          className="text-sm font-medium text-gray-700 mr-2"
        >
          Filter by status:
        </label>
        <select
          id="status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-gray-600">No requests found for this filter.</p>
      ) : (
        <ul className="space-y-4">
          {filteredOrders.map((order) => (
            <li
              key={order._id}
              className="bg-white p-5 border rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2 mb-1">
                    <PackageCheck className="w-5 h-5 text-green-600" />
                    Order ID:{" "}
                    <span className="text-gray-700">{order._id}</span>
                  </h3>
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{order.location}</span>
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Submitted:{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <span
                    className={`text-sm font-medium mt-2 inline-block px-3 py-1 rounded-full ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setExpandedOrderId((prev) =>
                      prev === order._id ? null : order._id
                    )
                  }
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  {expandedOrderId === order._id ? "Hide" : "Details"}
                </button>
              </div>

              {expandedOrderId === order._id && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                  <ul className="space-y-4">
                    {order.items.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-md"
                      >
                        {item.imageUrl ? (
                          <img
                            src={`http://localhost:5000${item.imageUrl}`}
                            alt={item.title || item.name || "No Title"}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) =>
                              (e.currentTarget.src = "/placeholder-image.jpg")
                            }
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded text-gray-500 text-xs">
                            No Image
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.title || item.name || "Untitled item"}
                          </p>
                          <p className="text-xs text-gray-600">
                            Quantity: {item.orderedQuantity}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRequests;
