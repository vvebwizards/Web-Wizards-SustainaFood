// src/pages/Cart.tsx
import React, { useState, FC } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Trash, Calendar, CheckCircle, X, MapPin } from "lucide-react";
import LocationPicker from "../components/LocationPicker";

const Cart: FC = () => {
  const { cartItems, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null);

  const handleSubmitClick = () => setShowModal(true);

  const handleOrderConfirm = async () => {
    if (!latLng) {
      alert("📍 Please select your delivery location on the map.");
      return;
    }

    const userId    = user?._id ?? user?.id;
    const userName  = user?.username ?? user?.name  ?? "Anonymous";
    const userEmail = user?.email    ?? "";

    if (!userId) {
      alert("❌ User ID is missing.");
      return;
    }

    const orderPayload = {
      recipientId: userId,
      userName,
      userEmail,
      location: `${latLng.lat},${latLng.lng}`,
      items: cartItems.map(item => ({
        productId:       item._id,
        orderedQuantity: item.quantity,
        name:            item.title,
        imageUrl:        item.imageUrl,
        title:           item.title
      }))
    };

    console.log("➡️ POST /api/orders payload:", orderPayload);

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Order submission failed");
      }

      alert("✅ Your request has been submitted!");
      clearCart();
      setShowModal(false);
      setLatLng(null);
    } catch (error: any) {
      console.error("Order error:", error);
      alert(`❌ ${error.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">🛒 Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500">
          Your cart is currently empty.
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {cartItems.map(item => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white border border-gray-200 shadow-md rounded-lg p-4"
              >
                {/* Image + Details */}
                <div className="flex gap-4 w-full sm:w-auto">
                  <img
                    src={`http://localhost:5000${
                      item.imageUrl.startsWith("/") ? "" : "/"
                    }${item.imageUrl}`}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <Calendar className="w-4 h-4 inline-block mr-1 mb-1" />
                      Expires: {new Date(item.expirationDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      Category: {item.category}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Available: {item.quantityToDonation} {item.unit}
                    </p>
                  </div>
                </div>

                {/* Qty controls + Remove */}
                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                      onClick={() =>
                        updateQuantity(
                          item._id,
                          Math.max(item.quantity - 1, 1)
                        )
                      }
                    >
                      −
                    </button>
                    <span className="font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                      onClick={() =>
                        updateQuantity(
                          item._id,
                          Math.min(item.quantity + 1, item.quantityToDonation)
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-sm text-red-600 hover:text-red-800 underline flex items-center gap-1"
                  >
                    <Trash className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Actions */}
          <div className="mt-10 bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={clearCart}
                className="w-full sm:w-auto bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Clear Cart
              </button>
              <button
                onClick={handleSubmitClick}
                disabled={cartItems.length === 0}
                className={`w-full sm:w-auto py-2 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  cartItems.length === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>Submit Request</span>
              </button>
            </div>
          </div>

          {/* Location Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Choose Delivery Location
                </h3>
                <LocationPicker onSelect={(lat, lng) => setLatLng({ lat, lng })} />
                {latLng && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: <strong>{latLng.lat.toFixed(5)}</strong>,{" "}
                    <strong>{latLng.lng.toFixed(5)}</strong>
                  </p>
                )}
                <button
                  onClick={handleOrderConfirm}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 mt-4 rounded-md flex justify-center items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm & Submit
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
