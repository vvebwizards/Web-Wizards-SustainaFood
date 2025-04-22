import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItem", // ✅ Must match your FoodItem model name
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderedQuantity: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "delivered"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
