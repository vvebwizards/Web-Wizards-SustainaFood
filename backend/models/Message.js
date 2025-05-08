// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // 1-to-1
  room:      { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },  // group
  content:   { type: String, required: true },
  isRead:    { type: Boolean, default: false },                      // ← NEW
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Message', messageSchema);
