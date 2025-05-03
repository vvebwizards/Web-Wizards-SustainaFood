import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem",
        required: true,
      },
      name: { type: String, required: true },
      orderedQuantity: { type: Number, required: true },
      imageUrl: { type: String },  // store image directly
      title: { type: String },     // store title directly
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  delivery: {
    method: String,
    scheduledDate: Date,
    scheduledTime: String,
    notes: String,
    trackingNumber: String,
    estimatedDelivery: Date,
  },
  location: { type: String, required: true },
}, {
  timestamps: true,
});

export const Order = mongoose.model('Orders', orderSchema);
