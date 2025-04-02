import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiredNotifHour: { type: Number, required: true },
  expiredNotifMinute: { type: Number, required: true },
  expiredNotifDate: { type: Number, required: true },
});

export default mongoose.model('Settings', SettingsSchema);