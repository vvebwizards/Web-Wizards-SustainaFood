import express from "express";
import { createOrders, getOrdersByRecipient } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrders);                // POST /api/orders
 // GET /api/orders/:recipientId
// in routes/orderRoutes.js
router.get("/recipient/:recipientId", getOrdersByRecipient);

// in controllers/orderController.js


export default router;
