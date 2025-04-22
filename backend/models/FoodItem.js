import mongoose from "mongoose";

const FoodItemSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, unique: true, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  expirationDate: { type: String, required: true },
  nutritionalInfo: { type: String },
  storageRequirements: { type: String },
  notes: { type: String },
  status: {
    type: String,
    enum: ['In Stock', 'Pending Donation', 'Scheduled', 'Donated', 'Expired', 'Damaged'],
    default: 'In Stock'
  },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ["free", "reduced"]
  },
  quantityToDonation: { type: Number, default: 0, min: 0 },
  freshness: { type: String, default: "Unknown" },
});

// ✅ Fix: use cached model if already compiled
export default mongoose.models.FoodItem || mongoose.model("FoodItem", FoodItemSchema);
