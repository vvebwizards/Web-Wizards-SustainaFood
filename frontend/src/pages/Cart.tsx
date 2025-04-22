import React from "react";
import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";

const Cart: React.FC = () => {
  const { cartItems, clearCart } = useCart();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">🛒 My Cart</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is currently empty.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {cartItems.map((item, index) => (
              <li key={index} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantityToDonation} {item.unit}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {item.type === "free" ? "Free" : `$${item.price?.toFixed(2)}`}
                </span>
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
