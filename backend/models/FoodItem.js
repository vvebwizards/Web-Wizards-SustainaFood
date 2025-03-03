import mongoose from "mongoose";

const FoodItemSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String },
  category: { type: String },
  quantity: { type: Number },
  unit: { type: String },
  expirationDate: { type: String },
  nutritionalInfo: { type: String, required: false },
  storageRequirements: { type: String, required: false },
  notes: { type: String, required: false },
  status: { 
    type: String, 
   enum: ['In Stock', 'ToDonation', 'Scheduled', 'Donated', 'Expired', 'Damaged'],
    default: 'In Stock'
  },
  imageUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("FoodItem",FoodItemSchema)