import { Order } from '../models/order.js';
import FoodItem from "../models/FoodItem.js";
import { v4 as uuidv4 } from 'uuid'; // For generating unique order numbers
import { getAuthenticatedUser } from "../utils/helpers.js";
export const createOrder = async (req, res) => {
  try {
    const { recipientId, location, items ,userName,userEmail} = req.body;

    if (!recipientId || !location || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update quantityToDonation for each item
    const formattedItems = [];
    let totalAmount = 0;

    for (const { itemId, orderedQuantity,name } of items) {
      const foodItem = await FoodItem.findById(itemId);
      if (!foodItem) continue;

      foodItem.quantityToDonation = Math.max(foodItem.quantityToDonation - orderedQuantity, 0);
      await foodItem.save();

    }
    console.log("formattedItems", formattedItems);

    const order = new Order({
      orderNumber: uuidv4(),
      recipientId,
      location,
      items,
      status: "pending",
      totalAmount,
      paymentStatus: "paid", 
      customer: {
        name: userName,
        email: userEmail,
        phone: "26762772",
      },
      shippingAddress: {
        street: "123 Main St",
        city: "Cityville",
        state: "StateX",
        zipCode: "12345",
        country: "Wonderland",
      },
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
    const user = await getAuthenticatedUser(req);

    const orders = await Order.find({ recipientId: user._id })
      .populate("items.productId", "title imageUrl")  // ✅ populate title + imageUrl
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("[GET ORDERS ERROR]", err);
    res.status(500).json({ error: "Server error" });
  }
};

