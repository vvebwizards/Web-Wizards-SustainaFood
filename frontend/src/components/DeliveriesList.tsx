import React from "react";
import { Truck, Calendar, MapPin } from "lucide-react";
import { Order } from "../types";

interface DeliveriesListProps {
  orders: Order[];
}

const DeliveriesList: React.FC<DeliveriesListProps> = ({ orders }) => {
  const deliveryOrders = orders.filter((order) => order.delivery);

  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date} ${time}`).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Scheduled Deliveries
        </h2>
      </div>

      {deliveryOrders.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <Truck className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2">No deliveries scheduled</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {deliveryOrders.map((order) => (
            <div key={order._id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">{order.customer.name}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.delivery.method === "express"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.delivery.method === "express" ? "Express" : "Standard"}{" "}
                  Delivery
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDateTime(
                    order.delivery.scheduledDate,
                    order.delivery.scheduledTime
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </div>
              </div>

              {order.delivery.trackingNumber && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Tracking Number:{" "}
                    <span className="font-medium text-gray-900">
                      {order.delivery.trackingNumber}
                    </span>
                  </p>
                </div>
              )}

              {order.delivery.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Notes:{" "}
                    <span className="text-gray-700">
                      {order.delivery.notes}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveriesList;
