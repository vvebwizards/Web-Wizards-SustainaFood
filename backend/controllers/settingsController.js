import { getAuthenticatedUser } from "../utils/helpers.js";
import Settings from '../models/Settings.js';

export const getSettings = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    const settings = await Settings.find({ userId: user._id });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { expiredNotifHour, expiredNotifMinute, expiredNotifDate } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { userId: user._id },
      { expiredNotifHour, expiredNotifMinute, expiredNotifDate },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
};