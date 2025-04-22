import React from "react";
import { useCart } from "../context/CartContext";
import { Trash2, Calendar } from "lucide-react";

const Cart: React.FC = () => {
  const { cartItems, clearCart, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">🛒 My Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is currently empty.</p>
      ) : (
        <>
          <ul className="space-y-6">
            {cartItems.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-4 border-b pb-4"
              >
                <img
                  src={`http://localhost:5000${item.imageUrl}`}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold text-lg">{item.title}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Expires:{" "}
                    {new Date(item.expirationDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.unit} | {item.type === "free" ? "Free" : `$${item.price}`}
                  </p>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 bg-gray-200 rounded"
                    onClick={() =>
                      updateQuantity(item._id, Math.max(item.quantityToDonation - 1, 1))
                    }
                  >
                    -
                  </button>
                  <span className="px-2">{item.quantityToDonation}</span>
                  <button
                    className="px-2 py-1 bg-gray-200 rounded"
                    onClick={() =>
                      updateQuantity(item._id, item.quantityToDonation + 1)
                    }
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-600 hover:text-red-800 ml-4"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={clearCart}
            className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
