import User from "../models/User.js";
import bcrypt from "bcrypt";
import { getAuthenticatedUser, getAuthenticatedUserwithPassword } from "../utils/helpers.js";
import {deviceLocationLoginAlert} from "../emailTemplates/deviceLocationLoginAlert.js";
/**
 * @route GET /api/users
 * @desc Get all users (excluding deleted ones)
 */
export async function getUsers(req, res) {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-password")
      .sort({ lastActive: -1 }); // Sort by last active

    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * @route PUT /api/users/block/:id
 * @desc Block/Unblock a user
 */
export async function blockUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    user.blocked = !user.blocked; // Toggle blocked status
    await user.save();

    res.json({ message: `User is now ${user.blocked ? "Blocked" : "Active"}`, user });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * @route DELETE /api/users/:id
 * @desc Soft delete a user
 */
export async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isDeleted = true;
    await user.save();

    res.json({ message: "User deleted successfully (soft delete)" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
}



export const updatePassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
  
    const user = await getAuthenticatedUserwithPassword(req, true);
    
    console.log("Fetched user:", user); 
    
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log("User password:", user.password); 

    if (!user.password) {
      return res.status(400).json({ message: "Password update not available for Google accounts." });
    }

 
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from current password." });
    }

   
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

   
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

