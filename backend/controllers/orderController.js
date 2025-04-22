import Order from "../models/orderModel.js";
import FoodItem from "../models/foodItem.js";

// POST /api/orders
export const createOrders = async (req, res) => {
  try {
    const orders = req.body;

    for (const order of orders) {
      const item = await FoodItem.findById(order.itemId);
      if (!item) continue;

      item.quantityToDonation = Math.max(item.quantityToDonation - order.orderedQuantity, 0);
      await item.save();

      await Order.create({
        item: item._id,
        quantity: order.orderedQuantity,
        recipientId: order.recipientId,
        location: order.location,
        status: "pending",
      });
    }

    res.status(201).json({ message: "Orders submitted successfully" });
  } catch (err) {
    console.error("[CREATE ORDER ERROR]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/orders/:recipientId
export const getOrdersByRecipient = async (req, res) => {
    try {
      const { recipientId } = req.params;
      const orders = await Order.find({ recipientId }).populate("itemId");
      res.status(200).json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  };


