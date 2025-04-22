import React from "react";
import { useCart } from "../context/CartContext";
import { Trash, Calendar, CheckCircle } from "lucide-react";


const Cart: React.FC = () => {
  const { cartItems, clearCart, updateQuantity, removeFromCart } = useCart();

  const handleOrder = () => {
    alert("✅ Your request has been submitted!");
    clearCart();
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
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white border border-gray-200 shadow-md rounded-lg p-4"
              >
                {/* Left: Image & info */}
                <div className="flex gap-4 w-full sm:w-auto">
                  <img
                    src={`http://localhost:5000${item.imageUrl}`}
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

                {/* Right: Controls */}
                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                      onClick={() =>
                        updateQuantity(item._id as string, Math.max(item.quantity - 1, 1))
                      }
                    >
                      -
                    </button>
                    <span className="font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                      onClick={() =>
                        updateQuantity(
                          item._id as string,
                          Math.min(item.quantity + 1, item.quantityToDonation)
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id as string)}
                    className="text-sm text-red-600 hover:text-red-800 underline flex items-center gap-1"
                  >
                    <Trash className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
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
  onClick={handleOrder}
  disabled={cartItems.length === 0}
  className={`w-full sm:w-auto py-2 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
    cartItems.length === 0
      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
      : "bg-green-600 text-white hover:bg-green-700"
  }`}
>
  <CheckCircle className="w-4 h-4" />
  <span>Submit Order</span>
</button>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
