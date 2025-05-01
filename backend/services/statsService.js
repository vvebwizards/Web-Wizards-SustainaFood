// backend/services/statsService.js
import User from '../models/User.js';
import Category from '../models/Category.js';
import FoodItem from '../models/FoodItem.js';
import Donation from '../models/Donation.js';
import Order from '../models/orderModel.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';

// Core metrics
export async function getUserMetrics() {
  const totalUsers = await User.countDocuments();
  const roles = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  const usersByRole = roles.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});
  return { totalUsers, usersByRole };
}

export async function getCategoryMetrics() {
  const totalCategories = await Category.countDocuments();
  const avgAgg = await FoodItem.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $group: { _id: null, avgItemsPerCategory: { $avg: '$count' } } }
  ]);
  return {
    totalCategories,
    avgItemsPerCategory: avgAgg[0]?.avgItemsPerCategory ?? 0
  };
}

export async function getFoodItemMetrics() {
  const stockAgg = await FoodItem.aggregate([
    { $match: { status: 'In Stock' } },
    { $group: { _id: null, count: { $sum: '$quantityInStock' } } }
  ]);
  const totalInStock = stockAgg[0]?.count ?? 0;

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  const expAgg = await FoodItem.aggregate([
    { $addFields: { expDate: { $dateFromString: { dateString: '$expirationDate' } } } },
    { $match: { expDate: { $lte: nextWeek } } },
    { $count: 'expiringCount' }
  ]);
  const expiringInNext7Days = expAgg[0]?.expiringCount ?? 0;

  return { totalInStock, expiringInNext7Days };
}

export async function getDonationMetrics() {
  const totalDonations = await Donation.countDocuments();
  const statusAgg = await Donation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const donationsByStatus = statusAgg.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});
  return { totalDonations, donationsByStatus };
}

export async function getOrderMetrics() {
  const totalOrders = await Order.countDocuments();
  const statusAgg = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const ordersByStatus = statusAgg.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});
  return { totalOrders, ordersByStatus };
}

export async function getNotificationMetrics() {
  const totalNotifications = await Notification.countDocuments();
  const unreadNotifications = await Notification.countDocuments({ isRead: false });
  return { totalNotifications, unreadNotifications };
}

export async function getSettingsMetrics() {
  const usersWithCustomSchedules = await Settings.distinct('userId');
  return { usersWithCustomSchedules: usersWithCustomSchedules.length };
}

// Cross‐model metrics
export async function getDonationsByCategory() {
  return Donation.aggregate([
    { $lookup: {
        from: 'fooditems',
        localField: 'foodItemId',
        foreignField: '_id',
        as: 'item'
      }
    },
    { $unwind: '$item' },
    { $group: { _id: '$item.category', count: { $sum: 1 } } }
  ]);
}

export async function getTopDonors(limit = 5) {
  return Donation.aggregate([
    { $group: { _id: '$donorId', totalQuantity: { $sum: '$quantityToDonation' } } },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit }
  ]);
}

export async function getAverageDonationSizePerItem() {
  return Donation.aggregate([
    { $group: {
        _id: '$foodItemId',
        totalQty: { $sum: '$quantityToDonation' },
        count: { $sum: 1 }
      }
    },
    { $project: { avgSize: { $divide: ['$totalQty', '$count'] } } }
  ]);
}

export async function getOrdersByLocation() {
  return Order.aggregate([{ $group: { _id: '$location', count: { $sum: 1 } } }]);
}

export async function getStockVsDonationRatio() {
  const [stockAgg, donationAgg] = await Promise.all([
    FoodItem.aggregate([{ $group: { _id: null, totalStock: { $sum: '$quantityInStock' } } }]),
    Donation.aggregate([{ $group: { _id: null, totalDonated: { $sum: '$quantityToDonation' } } }])
  ]);
  const totalStock = stockAgg[0]?.totalStock ?? 0;
  const totalDonated = donationAgg[0]?.totalDonated ?? 0;
  return { totalStock, totalDonated, ratio: totalStock ? totalDonated / totalStock : 0 };
}

export async function getExpiryConversionRate() {
  const data = await Donation.aggregate([
    { $lookup: {
        from: 'fooditems',
        localField: 'foodItemId',
        foreignField: '_id',
        as: 'item'
      }
    },
    { $unwind: '$item' },
    { $addFields: { expDate: { $dateFromString: { dateString: '$item.expirationDate' } } } },
    { $project: { donatedBefore: { $lte: ['$expDate', '$createdAt'] } } },
    { $group: { _id: '$donatedBefore', count: { $sum: 1 } } }
  ]);
  const before = data.find(d => d._id === true)?.count ?? 0;
  const after = data.find(d => d._id === false)?.count ?? 0;
  const total = before + after;
  return {
    donatedBeforeExpiry: before,
    donatedAfterExpiry: after,
    rateBeforeExpiry: total ? before / total : 0
  };
}
