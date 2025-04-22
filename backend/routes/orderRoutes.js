import express from "express";
import { createOrders, getOrdersByRecipient } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrders);                // POST /api/orders
router.get("/:recipientId", getOrdersByRecipient); // GET /api/orders/:recipientId

export default router;
