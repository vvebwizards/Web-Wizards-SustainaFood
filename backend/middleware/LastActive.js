import User from "../models/User.js";
export async function updateLastActive(req, res, next) {
    try {
      if (req.user) {
        await User.findByIdAndUpdate(req.user.id, { lastActive: new Date() });
      }
      next();
    } catch (error) {
      console.error("Error updating lastActive:", error);
      next(); // Continue without blocking request
    }}