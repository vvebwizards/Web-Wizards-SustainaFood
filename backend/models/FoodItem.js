import mongoose from "mongoose";

const FoodItemSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String , unique:true , required : true},
  category: { type: String ,required : true},
  quantity: { type: Number ,required : true},
  unit: { type: String , required:true },
  expirationDate: { type: String , required: true },
  nutritionalInfo: { type: String, required: false },
  storageRequirements: { type: String, required: false },
  notes: { type: String, required: false },
  status: { 
    type: String, 
   enum: ['In Stock', 'Pending Donation', 'Scheduled', 'Donated', 'Expired', 'Damaged'],
    default: 'In Stock'
  },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  imageUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  type : {
    type : String ,
    enum : ["free","reduced"]
  },
  quantityToDonation : { type: Number,default: 0, min: 0  },
});

export default mongoose.model("FoodItem",FoodItemSchema)