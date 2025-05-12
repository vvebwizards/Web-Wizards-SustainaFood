import mongoose from 'mongoose';

const roomMessageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room:      { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  content:   { type: String, required: true },
  isRead:    { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('RoomMessage', roomMessageSchema);
