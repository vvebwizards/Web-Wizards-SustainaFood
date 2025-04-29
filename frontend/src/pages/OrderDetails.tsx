import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Download,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Package,
  PackageCheck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { fetchOrder, updateOrderStatus } from "../services/api";
import { Order, OrderStatus } from "../types";

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const data = await fetchOrder(orderId);
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: OrderStatus) => {
    if (!id || !order) return;

    try {
      setUpdatingStatus(true);
      const updatedOrder = await updateOrderStatus(id, status);
      setOrder(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const statusSteps = [
    "pending",
    "processing",
    "packed",
    "shipped",
    "delivered",
  ];

  const getStatusStepNumber = (status: OrderStatus) => {
    return statusSteps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
        <h2 className="mt-2 text-xl font-bold text-gray-900">
          Order Not Found
        </h2>
        <p className="mt-1 text-gray-500">
          The order you're looking for doesn't exist or you don't have access to
          it.
        </p>
        <Link
          to="/dashboard/orders"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = getStatusStepNumber(order.status);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Order {order.orderNumber}
          </h1>
        </div>
        <div className="flex mt-4 sm:mt-0 space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="mr-2 h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Order Summary
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Created on {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Order ID</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {order.orderNumber}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Total Amount
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                ${order.totalAmount.toFixed(2)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Payment Status
              </dt>
              <dd className="mt-1 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : order.paymentStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.paymentStatus === "paid"
                    ? "Paid"
                    : order.paymentStatus === "pending"
                    ? "Pending"
                    : order.paymentStatus === "failed"
                    ? "Failed"
                    : order.paymentStatus === "refunded"
                    ? "Refunded"
                    : "Partially Refunded"}
                </span>
              </dd>
            </div>
            {order.trackingNumber && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Tracking Number
                </dt>
                <dd className="mt-1 text-sm text-blue-600 hover:text-blue-800">
                  <a href="#">{order.trackingNumber}</a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white shadow sm:rounded-lg mb-6 overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order Status
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Track your order's journey
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="p-4 sm:p-6">
            <div className="relative">
              {/* Progress bar */}
              <div className="overflow-hidden h-2 mb-8 text-xs flex rounded bg-gray-200">
                <div
                  style={{
                    width: `${
                      currentStep >= 0
                        ? Math.min(
                            100,
                            (currentStep / (statusSteps.length - 1)) * 100
                          )
                        : 0
                    }%`,
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                ></div>
              </div>

              {/* Status steps */}
              <div className="flex justify-between">
                {statusSteps.map((status, index) => {
                  const isCompleted = currentStep >= index;
                  const isCurrent = currentStep === index;

                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div
                        className={`
                        flex items-center justify-center w-10 h-10 rounded-full 
                        ${
                          isCompleted
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }
                        ${isCurrent ? "ring-4 ring-blue-100" : ""}
                      `}
                      >
                        {status === "pending" && <Clock className="h-5 w-5" />}
                        {status === "processing" && (
                          <PackageCheck className="h-5 w-5" />
                        )}
                        {status === "packed" && <Package className="h-5 w-5" />}
                        {status === "shipped" && <Truck className="h-5 w-5" />}
                        {status === "delivered" && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="text-center mt-2">
                        <p
                          className={`text-xs font-medium ${
                            isCompleted ? "text-blue-600" : "text-gray-500"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </p>
                        {isCurrent && (
                          <span className="block text-xs text-gray-500 mt-1">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status update buttons */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Update Status
              </h4>
              <div className="flex flex-wrap gap-2">
                {statusSteps.map((status, index) => {
                  const isCurrentStatus = order.status === status;
                  const isPastStatus =
                    getStatusStepNumber(order.status) > index;
                  const isNextStatus =
                    getStatusStepNumber(order.status) === index - 1;

                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status as OrderStatus)}
                      disabled={
                        isCurrentStatus ||
                        isPastStatus ||
                        !isNextStatus ||
                        updatingStatus
                      }
                      className={`
                        px-3 py-1.5 text-xs font-medium rounded-md
                        ${
                          isCurrentStatus
                            ? "bg-blue-100 text-blue-800 cursor-default"
                            : isPastStatus
                            ? "bg-gray-100 text-gray-600 cursor-not-allowed opacity-60"
                            : isNextStatus
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-100 text-gray-600 cursor-not-allowed opacity-60"
                        }
                      `}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {isCurrentStatus && " (Current)"}
                    </button>
                  );
                })}
                {order.status !== "cancelled" && (
                  <button
                    onClick={() => handleStatusChange("cancelled")}
                    disabled={
                      order.status === "delivered" ||
                      order.status === "cancelled" ||
                      updatingStatus
                    }
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg lg:col-span-1">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Customer Information
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.customer.name}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.customer.email}
                </dd>
              </div>
              {order.customer.phone && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Phone number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.customer.phone}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg lg:col-span-2">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Shipping Information
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-5 sm:p-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Shipping Address
                </h4>
                <div className="mt-3 text-sm text-gray-900">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Delivery Information
                </h4>
                <div className="mt-3 text-sm text-gray-900">
                  {order.estimatedDelivery ? (
                    <p>
                      Estimated delivery: {formatDate(order.estimatedDelivery)}
                    </p>
                  ) : (
                    <p>
                      Delivery date will be available once the order is
                      processed.
                    </p>
                  )}
                  {order.trackingNumber && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-500">
                        Tracking Number
                      </p>
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        {order.trackingNumber}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order Items
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    SKU
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sku || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <th
                    scope="row"
                    colSpan={4}
                    className="px-6 py-3 text-right text-sm font-medium text-gray-500"
                  >
                    Subtotal
                  </th>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={4}
                    className="px-6 py-3 text-right text-sm font-medium text-gray-900"
                  >
                    Total
                  </th>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Notes
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <p className="text-sm text-gray-900">{order.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
