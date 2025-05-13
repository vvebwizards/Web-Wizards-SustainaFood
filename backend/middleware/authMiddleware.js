import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Not authenticated - No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    await isAuthenticated(req, res, async () => {
      // Then check if user is admin
      if (req.user && req.user.role === "admin") {
        return next();
      }
      return res.status(403).json({ message: "Unauthorized: Admins only" });
    });
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(403).json({ message: "Unauthorized" });
  }
};
