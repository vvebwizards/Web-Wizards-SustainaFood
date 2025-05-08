import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isSupport: { type: Boolean, default: false },
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
