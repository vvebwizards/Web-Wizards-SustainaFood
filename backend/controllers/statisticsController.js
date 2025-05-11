import mongoose from 'mongoose';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { Order } from '../models/order.js';
import moment from 'moment'; // npm install moment

export const getStatisticsByRole = async (req, res) => {
  const role = req.params.role;  
  const userId = req.query.userId;
  
  console.log(`📥 Incoming stats request -> role: ${role}, userId: ${userId}`);
  
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
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.error('❌ Invalid donor ID:', userId);
          return res.status(400).json({ message: 'Invalid donor ID' });
        }
        const donorId = new mongoose.Types.ObjectId(userId);
  
        const donorDonations = await Donation.find({ donorId });
        console.log(`Donor donations count: ${donorDonations.length}`);
  
        const total = donorDonations.reduce((sum, d) => sum + (d.quantityToDonation || 0), 0);
        const expired = donorDonations.filter(d => new Date(d.expirationDate) < new Date())
                                      .reduce((sum, d) => sum + (d.quantityToDonation || 0), 0);
  
        const avgShelfLife = donorDonations.length
          ? donorDonations.reduce((sum, d) => {
              const created = new Date(d.createdAt);
              const expiry = new Date(d.expirationDate);
              const days = (expiry - created) / (1000 * 60 * 60 * 24);
              return sum + (isNaN(days) ? 0 : days);
            }, 0) / donorDonations.length
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
        const totalReceived = completed.reduce((sum, o) => sum + (o.totalQuantity || 0), 0);
  
        console.log(`Recipient stats -> completed: ${completed.length}, pending: ${pending.length}, totalReceived: ${totalReceived}`);
  
        return res.json({
          receivedDonations: totalReceived,
          pendingDeliveries: pending.length,
          completedDeliveries: completed.length,
          deliveryHistory: [], // Fill with actual data if available
          foodCategories: {}   // Fill with actual data if available
        });
      }
  
      // VOLUNTEER STATS
      case 'volunteer': {
        console.log('🟢 Entering volunteer branch');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.error('❌ Invalid volunteer ID:', userId);
          return res.status(400).json({ message: 'Invalid volunteer ID' });
        }
  
        const volunteerId = new mongoose.Types.ObjectId(userId);
        const orders = await Order.find({ volunteerId });
  
        const activeAssignments = await Order.countDocuments({ volunteerId, status: 'in-progress' });
        const totalDeliveries = orders.length;
        const totalHours = orders.reduce((sum, o) => sum + (o.deliveryTimeHours || 1), 0);
  
        console.log(`Volunteer stats -> deliveries: ${totalDeliveries}, totalHours: ${totalHours}, activeAssignments: ${activeAssignments}`);
  
        return res.json({
          deliveriesMade: totalDeliveries,
          hoursVolunteered: totalHours,
          activeAssignments: activeAssignments,
          weeklyDeliveries: [], // Fill with actual data if available
          deliveryTypes: {}     // Fill with actual data if available
        });
      }
  
      default:
        console.error('❌ Unknown role:', role);
        return res.status(400).json({ message: 'Invalid role specified' });
    }
  } catch (error) {
    console.error('❌ Statistics error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
