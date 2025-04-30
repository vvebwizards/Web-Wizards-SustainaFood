import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String  , required : true},
  quantityToDonation: { type: Number ,required : true},
  foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  imageUrl: { type: String },
  category: { type: String ,required : true},
  expirationDate: { type: String , required: true },
  unit: { type: String , required:true },
  status: { 
    type: String, 
   enum: ['Pending Donation','Donated', 'Expired'],
    default: 'Pending Donation'
  },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
 
});

export default mongoose.model("Donation",DonationSchema)