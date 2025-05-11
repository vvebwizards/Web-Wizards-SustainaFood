import mongoose from 'mongoose';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { Order } from '../models/order.js';

export const getStatisticsByRole = async (req, res) => {
  const role = req.params.role;  
  const userId = req.query.userId;
  
  console.log(`📥 Incoming stats request -> role: ${role}, userId: ${userId}`);
  
  try {
    switch (role) {
      // ADMIN STATS
      case 'admin': {
        console.log('🟢 Entering admin branch');
        // For admin, we ignore userId and compute system-wide stats
        const totalUsers = await User.countDocuments();
        const activeVolunteers = await User.countDocuments({ role: 'volunteer', active: true });
  
        const totalDonationWeight = await Donation.aggregate([
          { $match: { quantityToDonation: { $exists: true, $ne: null } } },
          { $group: { _id: null, total: { $sum: '$quantityToDonation' } } }
        ]);
  
        console.log(`Admin stats -> totalUsers: ${totalUsers}, activeVolunteers: ${activeVolunteers}, totalDonationWeight: ${totalDonationWeight[0]?.total || 0}`);
  
        return res.json({
          totalDonations: totalUsers,
          expiredQuantity: activeVolunteers,
          averageShelfLife: totalDonationWeight[0]?.total || 0,
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
          totalDonations: totalReceived,
          expiredQuantity: pending.length,
          averageShelfLife: completed.length  // Replace with another metric if needed
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
          totalDonations: totalDeliveries,
          expiredQuantity: totalHours,
          averageShelfLife: activeAssignments
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
