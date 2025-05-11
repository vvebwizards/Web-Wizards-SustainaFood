import express from "express";
import { Order } from '../models/order.js';
import {
  createOrder,
  getOrdersByRecipient ,
  assignClustersToOrders
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get('/my', getOrdersByRecipient);
router.get('/assign_clusters',assignClustersToOrders);

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/delivery', async (req, res) => {
  try {
    const { method, date, time, notes } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        delivery: {
          method,
          scheduledDate: new Date(date),
          scheduledTime: time,
          notes,
          trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          estimatedDelivery: new Date(date)
        },
        status: 'processing'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processing: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shipped: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          returned: {
            $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats[0] || {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



export default router;
