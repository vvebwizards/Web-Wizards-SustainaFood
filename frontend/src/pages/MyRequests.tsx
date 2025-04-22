import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MapPin, PackageCheck, Clock, ClipboardList } from "lucide-react";

interface Order {
  _id: string;
  itemId: {
    title: string;
    expirationDate: string;
  };
  recipientId: string;
  orderedQuantity: number;
  location: string;
  status: string;
  createdAt: string;
}

const MyRequests: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    const fetchOrders = async () => {
      try {
        console.log("📦 Fetching orders for user:", user._id);
        const response = await fetch(`http://localhost:5000/api/orders/recipient/${user._id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) return <div className="p-6 text-center">Loading your requests...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-blue-600" /> My Requests
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">You have not submitted any requests yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order._id}
              className="bg-white p-5 border rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2 mb-1">
                <PackageCheck className="w-5 h-5 text-green-600" />
                Order ID: <span className="text-gray-700">{order._id}</span>
              </h3>
              <p className="text-sm text-gray-700">
                <strong>Item:</strong> {order.itemId?.title || "Item name unavailable"}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Quantity:</strong> {order.orderedQuantity}
              </p>
              <p className="text-sm text-gray-700 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{order.location}</span>
              </p>
              <p className="text-sm text-gray-700 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Submitted: {new Date(order.createdAt).toLocaleString()}
              </p>
              <span
                className={`text-sm font-medium mt-2 inline-block px-3 py-1 rounded-full ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRequests;
