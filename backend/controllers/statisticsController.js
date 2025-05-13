import mongoose from 'mongoose';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { Order } from '../models/order.js';
import moment from 'moment'; // npm install moment

// List of valid roles
const VALID_ROLES = ['donor', 'recipient', 'volunteer', 'admin'];

export const getStatisticsByRole = async (req, res) => {
  const role = req.params.role?.toLowerCase();
  const userId = req.query.userId;
  
  console.log(`📥 Incoming stats request -> role: ${role}, userId: ${userId}`);
  
  // Validate role
  if (!VALID_ROLES.includes(role)) {
    console.error(`❌ Invalid role requested: ${role}`);
    return res.status(400).json({ 
      success: false, 
      message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` 
    });
  }

  // Validate user ID for non-admin roles
  if (role !== 'admin' && !userId) {
    console.error('❌ User ID is required for non-admin statistics');
    return res.status(400).json({ 
      success: false, 
      message: 'User ID is required' 
    });
  }

  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    console.error(`❌ Invalid user ID: ${userId}`);
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid user ID' 
    });
  }
  
  try {
    switch (role) {
      // ADMIN STATS
     case 'admin': {
  console.log('🟢 Entering admin branch');

  const totalUsers = await User.countDocuments();
  const activeVolunteers = await User.countDocuments({ role: 'volunteer' });

  const totalDonationWeight = await Donation.aggregate([
    { $match: { quantityToDonation: { $exists: true, $ne: null } } },
    { $group: { _id: null, total: { $sum: '$quantityToDonation' } } }
  ]);

  const donors = await User.countDocuments({ role: 'donor' });
  const recipients = await User.countDocuments({ role: 'recipient' });
  const volunteers = activeVolunteers;

  // Calculate monthly growth for the last 6 months
  const months = 6;
  const monthlyGrowth = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = moment().subtract(i, 'months').startOf('month').toDate();
    const end = moment().subtract(i, 'months').endOf('month').toDate();
    const count = await User.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });
    monthlyGrowth.push(count);
  }

  return res.json({
    totalUsers,
    activeVolunteers,
    monthlyDonations: totalDonationWeight[0]?.total || 0,
    monthlyGrowth,
    userTypes: {
      donors,
      recipients,
      volunteers
    }
  });
}

  
      // DONOR STATS
      case 'donor': {
        console.log('🟢 Entering donor branch');
        const donorId = new mongoose.Types.ObjectId(userId);
  
        const donorDonations = await Donation.find({ donorId });
        console.log(`Donor donations count: ${donorDonations.length}`);
  
        const total = donorDonations.reduce((sum, d) => sum + (d.quantityToDonation || 0), 0);
        const expired = donorDonations
          .filter(d => d.expirationDate && new Date(d.expirationDate) < new Date())
          .reduce((sum, d) => sum + (d.quantityToDonation || 0), 0);
  
        const validDonations = donorDonations.filter(d => d.createdAt && d.expirationDate);
        const avgShelfLife = validDonations.length
          ? validDonations.reduce((sum, d) => {
              const created = new Date(d.createdAt);
              const expiry = new Date(d.expirationDate);
              const days = (expiry - created) / (1000 * 60 * 60 * 24);
              return sum + (isNaN(days) ? 0 : days);
            }, 0) / validDonations.length
          : 0;
  
        const donationCountsByFoodItem = await Donation.aggregate([
          { $match: { donorId, foodItemId: { $exists: true, $ne: null } } },
          {
            $lookup: {
              from: 'fooditems', // ensure this matches your collection name exactly
              localField: 'foodItemId',
              foreignField: '_id',
              as: 'foodInfo'
            }
          },
          { $unwind: '$foodInfo' },
          {
            $group: {
              _id: '$foodInfo.title', // use title instead of name
              count: { $sum: '$quantityToDonation' }
            }
          },
          {
            $project: {
              foodItem: '$_id',
              count: 1,
              _id: 0
            }
          }
        ]);
  
        console.log('Donor aggregation result:', donationCountsByFoodItem);
  
        return res.json({
          totalDonations: total,
          expiredQuantity: expired,
          averageShelfLife: Math.round(avgShelfLife),
          donationCountsByFoodItem
        });
      }
  
      // RECIPIENT STATS
      case 'recipient': {
        console.log('🟢 Entering recipient branch');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.error('❌ Invalid recipient ID:', userId);
          return res.status(400).json({ message: 'Invalid recipient ID' });
        }
  
        const recipientId = new mongoose.Types.ObjectId(userId);
        const orders = await Order.find({ recipientId });
  
        const completed = orders.filter(o => o.status === 'delivered');
        const pending = orders.filter(o => o.status === 'pending');
        const totalReceived = completed.reduce((sum, o) => {
          return sum + o.items.reduce((itemSum, item) => itemSum + (item.orderedQuantity || 0), 0);
        }, 0);
  
        console.log(`Recipient stats -> completed: ${completed.length}, pending: ${pending.length}, totalReceived: ${totalReceived}`);
  
        const months = 6;
        const monthlyReceived = [];
  
        for (let i = months - 1; i >= 0; i--) {
          const start = moment().subtract(i, 'months').startOf('month').toDate();
          const end = moment().subtract(i, 'months').endOf('month').toDate();
  
          // Find delivered orders for this recipient in this month
          const orders = await Order.find({
            recipientId,
            status: 'delivered',
            createdAt: { $gte: start, $lte: end }
          });
  
          // Sum all orderedQuantity for delivered orders in this month
          const total = orders.reduce((sum, o) => {
            return sum + o.items.reduce((itemSum, item) => itemSum + (item.orderedQuantity || 0), 0);
          }, 0);
  
          monthlyReceived.push(total);
        }
  
        const deliveredOrders = await Order.find({ recipientId, status: 'delivered' }).populate('items.productId');
        const categoryCounts = {};
  
        deliveredOrders.forEach(order => {
          order.items.forEach(item => {
            const category = item.productId?.category || 'Unknown';
            categoryCounts[category] = (categoryCounts[category] || 0) + (item.orderedQuantity || 0);
          });
        });
  
        const categories = Object.keys(categoryCounts);
        const categoryData = categories.map(cat => categoryCounts[cat]);
  
        return res.json({
          receivedDonations: totalReceived,
          pendingDeliveries: pending.length,
          completedDeliveries: completed.length,
          monthlyReceived,
          categoryLabels: categories,
          categoryData: categoryData
        });
      }
  
      // VOLUNTEER STATS
      case 'volunteer': {
        console.log('🟢 Entering global volunteer stats branch');

        // List all possible statuses from your model
        const statuses = [
          "pending",
          "processing",
          "packed",
          "shipped",
          "delivered",
          "cancelled",
          "returned"
        ];

        // Count orders for each status
        const statusCounts = {};
        for (const status of statuses) {
          statusCounts[status] = await Order.countDocuments({ status });
        }

        // Monthly deliveries for the last 6 months
        const months = 6;
        const monthlyDeliveries = [];
        for (let i = months - 1; i >= 0; i--) {
          const start = moment().subtract(i, 'months').startOf('month').toDate();
          const end = moment().subtract(i, 'months').endOf('month').toDate();
          const count = await Order.countDocuments({
            status: 'delivered',
            createdAt: { $gte: start, $lte: end }
          });
          monthlyDeliveries.push(count);
        }

        // Total orders (for a summary card)
        const totalOrders = await Order.countDocuments();

        return res.json({
          statusCounts,      // Object with status counts
          monthlyDeliveries, // Array of monthly deliveries
  }
});

// DONOR STATS
case 'donor': {
  console.log(' Entering donor branch');
  const donorId = new mongoose.Types.ObjectId(userId);

  const donorDonations = await Donation.find({ donorId });
  console.log(`Donor donations count: ${donorDonations.length}`);

  const total = donorDonations.reduce((sum, d) => sum + (d.quantityToDonation || 0), 0);
  const expired = donorDonations
    .filter(d => d.expirationDate && new Date(d.expirationDate) < new Date())
    .reduce((sum, d) => sum + (d.quantityToDonation || 0), 0);

  const validDonations = donorDonations.filter(d => d.createdAt && d.expirationDate);
  const avgShelfLife = validDonations.length
    ? validDonations.reduce((sum, d) => {
        const created = new Date(d.createdAt);
        const expiry = new Date(d.expirationDate);
        const days = (expiry - created) / (1000 * 60 * 60 * 24);
        return sum + (isNaN(days) ? 0 : days);
      }, 0) / validDonations.length
    : 0;

  const donationCountsByFoodItem = await Donation.aggregate([
    { $match: { donorId, foodItemId: { $exists: true, $ne: null } } },
    {
      $lookup: {
        from: 'fooditems', // ensure this matches your collection name exactly
        localField: 'foodItemId',
        foreignField: '_id',
        as: 'foodInfo'
      }
    },
    { $unwind: '$foodInfo' },
    {
      $group: {
        _id: '$foodInfo.title', // use title instead of name
        count: { $sum: '$quantityToDonation' }
      }
    },
    {
      $project: {
        foodItem: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);

  console.log('Donor aggregation result:', donationCountsByFoodItem);

  return res.json({
    totalDonations: total,
    expiredQuantity: expired,
    averageShelfLife: Math.round(avgShelfLife),
    donationCountsByFoodItem
  });
}

// RECIPIENT STATS
case 'recipient': {
  console.log(' Entering recipient branch');
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error(' Invalid recipient ID:', userId);
    return res.status(400).json({ message: 'Invalid recipient ID' });
  }

  const recipientId = new mongoose.Types.ObjectId(userId);
  const orders = await Order.find({ recipientId });

  const completed = orders.filter(o => o.status === 'delivered');
  const pending = orders.filter(o => o.status === 'pending');
  const totalReceived = completed.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => itemSum + (item.orderedQuantity || 0), 0);
  }, 0);

  console.log(`Recipient stats -> completed: ${completed.length}, pending: ${pending.length}, totalReceived: ${totalReceived}`);

  const months = 6;
  const monthlyReceived = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = moment().subtract(i, 'months').startOf('month').toDate();
    const end = moment().subtract(i, 'months').endOf('month').toDate();

    // Find delivered orders for this recipient in this month
    const orders = await Order.find({
      recipientId,
      status: 'delivered',
      createdAt: { $gte: start, $lte: end }
    });

    // Sum all orderedQuantity for delivered orders in this month
    const total = orders.reduce((sum, o) => {
      return sum + o.items.reduce((itemSum, item) => itemSum + (item.orderedQuantity || 0), 0);
    }, 0);

    monthlyReceived.push(total);
  }

  const deliveredOrders = await Order.find({ recipientId, status: 'delivered' }).populate('items.productId');
  const categoryCounts = {};

  deliveredOrders.forEach(order => {
    order.items.forEach(item => {
      const category = item.productId?.category || 'Unknown';
      categoryCounts[category] = (categoryCounts[category] || 0) + (item.orderedQuantity || 0);
    });
  });

  const categories = Object.keys(categoryCounts);
  const categoryData = categories.map(cat => categoryCounts[cat]);

  return res.json({
    receivedDonations: totalReceived,
    pendingDeliveries: pending.length,
    completedDeliveries: completed.length,
    monthlyReceived,
    categoryLabels: categories,
    categoryData: categoryData
  });
}

// VOLUNTEER STATS
case 'volunteer': {
  console.log(' Entering global volunteer stats branch');

  // List all possible statuses from your model
  const statuses = [
    "pending",
    "processing",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
    "returned"
  ];

  // Count orders for each status
  const statusCounts = {};
  for (const status of statuses) {
    statusCounts[status] = await Order.countDocuments({ status });
  }

  // Monthly deliveries for the last 6 months
  const months = 6;
  const monthlyDeliveries = [];
  for (let i = months - 1; i >= 0; i--) {
    const start = moment().subtract(i, 'months').startOf('month').toDate();
    const end = moment().subtract(i, 'months').endOf('month').toDate();
    const count = await Order.countDocuments({
      status: 'delivered',
      createdAt: { $gte: start, $lte: end }
    });
    monthlyDeliveries.push(count);
  }

  // Total orders (for a summary card)
  const totalOrders = await Order.countDocuments();

  return res.json({
    statusCounts,      // Object with status counts
    monthlyDeliveries, // Array of monthly deliveries
    totalOrders        // Total number of orders
  });
}

default:
  console.error(' Reached default case for role:', role);
  return res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
}

} catch (error) {
  console.error(' Error in getStatisticsByRole:', error);
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message 
  });
}
