import mongoose from 'mongoose';
import Donation from '../models/Donation.js';
import { getAuthenticatedUser } from "../utils/helpers.js";
import FoodItem from "../models/FoodItem.js";

export const countDonationsByFoodItem = async (req, res) => {
  const user = await getAuthenticatedUser(req); 
  const donorId = user._id;

  try {
    const donationCounts = await Donation.aggregate([
      { 
        $match: { 
          donorId: new mongoose.Types.ObjectId(donorId), 
          status: 'Donated' 
        } 
      },
      { 
        $group: { 
          _id: '$foodItemId', 
          totalDonations: { $sum: '$quantityToDonation' } 
        } 
      },
      { 
        $lookup: { 
          from: 'fooditems', 
          localField: '_id', 
          foreignField: '_id', 
          as: 'foodItem' 
        } 
      },
      { $unwind: '$foodItem' },
      { 
        $project: { 
          foodItemTitle: '$foodItem.title', 
          unit: '$foodItem.unit',
          totalDonations: 1 
        } 
      }
    ]);

    return res.status(200).json(donationCounts || []);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching donations by food item.", error });
  }
};

export const totalDonationsByUnit = async (req, res) => {
  const user = await getAuthenticatedUser(req);
  const donorId = user._id;

  try {
    const totalByUnit = await Donation.aggregate([
      { 
        $match: { 
          donorId: new mongoose.Types.ObjectId(donorId), 
          status: 'Donated' 
        } 
      },
      { 
        $group: { 
          _id: '$unit',
          totalQuantity: { $sum: '$quantityToDonation' }
        }
      },
      {
        $project: {
          unit: '$_id',
          totalQuantity: 1,
          _id: 0
        }
      }
    ]);

    return res.status(200).json(totalByUnit || []);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error calculating total donations by unit.", error });
  }
};

export const totalExpiredQuantityByUnit = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req); 
    const donorId = user._id;

    const expiredStats = await FoodItem.aggregate([
      {
        $match: {
          donorId: new mongoose.Types.ObjectId(donorId),
          status: "Expired",
        },
      },
      {
        $group: {
          _id: "$unit",
          totalExpiredQuantity: { $sum: "$quantityToDonation" }
        }
      },
      {
        $project: {
          unit: "$_id",
          totalExpiredQuantity: 1,
          _id: 0
        }
      }
    ]);

    return res.status(200).json(expiredStats || []);
  } catch (error) {
    console.error("Error getting expired food quantities:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const averageShelfLifeBeforeDonation = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    const donorId = user._id;

    const result = await FoodItem.aggregate([
      {
        $match: {
          donorId: new mongoose.Types.ObjectId(donorId),
          expirationDate: { $ne: null }
        }
      },
      {
        $addFields: {
          expirationDateParsed: {
            $toDate: "$expirationDate"
          }
        }
      },
      {
        $project: {
          shelfLifeInDays: {
            $divide: [
              { $subtract: ["$expirationDateParsed", "$createdAt"] },
              1000 * 60 * 60 * 24 
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageShelfLife: { $avg: "$shelfLifeInDays" }
        }
      },
      {
        $project: {
          _id: 0,
          averageShelfLife: { $round: ["$averageShelfLife", 2] }
        }
      }
    ]);

    const average = result?.[0]?.averageShelfLife ?? 0;
    return res.status(200).json({ averageShelfLife: `${average} days` });
  } catch (error) {
    console.error("Error calculating average shelf life:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getWastedVsDonatedRatio = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    const donorId = user._id;

    const donated = await Donation.aggregate([
      {
        $match: {
          donorId: new mongoose.Types.ObjectId(donorId),
          status: "Donated",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantityToDonation" },
        },
      },
    ]);
    const donatedQuantity = donated[0]?.total || 0;

    const expired = await FoodItem.aggregate([
      {
        $match: {
          donorId: new mongoose.Types.ObjectId(donorId),
          status: "Expired",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantityToDonation" },
        },
      },
    ]);
    const wastedQuantity = expired[0]?.total || 0;

    const total = donatedQuantity + wastedQuantity;
    const ratio = total === 0 ? 0 : wastedQuantity / total;

    return res.status(200).json({
      donorId,
      donatedQuantity,
      wastedQuantity,
      wasteToDonationRatio: ratio.toFixed(3),
    });
  } catch (error) {
    console.error("Error calculating waste-to-donation ratio:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
