import User from "../models/User.js";

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
