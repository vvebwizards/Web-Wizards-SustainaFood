// models/Room.js
import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  isPrivate:   { type: Boolean, default: false },        // <— here
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Room', RoomSchema);
