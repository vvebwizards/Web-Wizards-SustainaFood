import Order from "../models/orderModel.js";
import FoodItem from "../models/foodItem.js";

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { recipientId, location, items } = req.body;

    if (!recipientId || !location || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update quantityToDonation for each item
    for (const { itemId, orderedQuantity } of items) {
      const foodItem = await FoodItem.findById(itemId);
      if (!foodItem) continue;

      foodItem.quantityToDonation = Math.max(foodItem.quantityToDonation - orderedQuantity, 0);
      await foodItem.save();
    }

    const order = new Order({
      recipientId,
      location,
      items,
      status: "pending",
    });

    await order.save();
    res.status(201).json({ message: "Order submitted successfully", order });
  } catch (err) {
    console.error("[CREATE ORDER ERROR]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/orders/recipient/:recipientId
export const getOrdersByRecipient = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const orders = await Order.find({ recipientId })
      .populate("items.itemId")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("[GET ORDERS ERROR]", err);
    res.status(500).json({ error: "Server error" });
  }
};
