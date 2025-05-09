import { Order } from '../models/order.js';
import FoodItem from "../models/FoodItem.js";
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedUser } from "../utils/helpers.js";
import User from '../models/User.js'; 
import Donation from '../models/Donation.js';
import { getPredictionUrgencyTransportation } from '../utils/predict.js';
export const createOrder = async (req, res) => {
  try {
    const { recipientId, location, items ,userName,userEmail} = req.body;

    if (!recipientId || !location || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const formattedItems = [];
    let totalAmount = 0;

    for (const { itemId, orderedQuantity,name } of items) {
      const foodItem = await FoodItem.findById(itemId);
      if (!foodItem) continue;

      foodItem.quantityToDonation = Math.max(foodItem.quantityToDonation - orderedQuantity, 0);
      await foodItem.save();

    }
    console.log("formattedItems", formattedItems);

    const order = new Order({
      orderNumber: uuidv4(),
      recipientId,
      location,
      items,
      status: "pending",
      totalAmount,
      paymentStatus: "paid", 
      customer: {
        name: userName,
        email: userEmail,
        phone: "26762772",
      },
      shippingAddress: {
        street: "123 Main St",
        city: "Cityville",
        state: "StateX",
        zipCode: "12345",
        country: "Wonderland",
      },
    });

    await order.save();
    for (const item of order.items) {
      const productId = item._id; 
      const urgencyScore = await getTransportationUrgency(order._id, productId);
      item.urgencyScore = urgencyScore; 
    }
    await order.save();
    res.status(201).json({ message: "Order submitted successfully", order });
  } catch (err) {
    console.error("[CREATE ORDER ERROR]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrdersByRecipient = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);

    const orders = await Order.find({ recipientId: user._id })
      .populate("items.productId", "title imageUrl")  
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("[GET ORDERS ERROR]", err);
    res.status(500).json({ error: "Server error" });
  }
};

//transportation urgency  prediction

// Define the daysDifference function at the top
function daysDifference(date1, date2) {
  const diffTime = date2 - date1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

async function getExpiryDaysLeft(orderId, productId) {
  try {
    const order = await Order.findById(orderId);
    await order.populate('items.productId');
    const orderedItem = order.items.find(item => item._id.equals(productId));
    const donationItem = await Donation.findOne({ _id: orderedItem.productId });
    const expirationDate = new Date(donationItem.expirationDate);
    const currentDate = new Date();
    const daysLeft = daysDifference(currentDate, expirationDate);
    console.log("Days left until expiration:", daysLeft);
    return daysLeft;
  } catch (error) {
    console.error('Error getting expiry days left:', error.message);
    throw error;
  }
}

async function getOrderedQuantity(orderId,productId) {
  try {
    const order = await Order.findById(orderId);
    await order.populate('items.productId');
    const orderedItem = order.items.find(item => item._id.equals(productId));
    const orderedQuantity = orderedItem.orderedQuantity;
    console.log("orderred quantity : ",orderedQuantity);
    return orderedQuantity
  } catch (error) {
    console.error('Error getting ordered quantity:', error.message);
    throw error;
  }
}
function getHourFromTime(timeString) {
  if (!timeString) return 12; 
  const hour = parseInt(timeString.split(':')[0], 10);
  return isNaN(hour) ? 12 : hour;
}


export async function getDonationTimeHour(orderId, productId) {
  try {
    const order = await Order.findById(orderId);
    await order.populate('items.productId');
    const orderedItem = order.items.find(item => item._id.equals(productId));
    const donationItem = await Donation.findOne({ _id: orderedItem.productId });
    const timePart = donationItem.createdAt.toISOString().split('T')[1].split('.')[0];
    const hourFromTime = getHourFromTime(timePart);
    console.log("Hour from donation time:", hourFromTime);
    return hourFromTime;
  } catch (error) {
    console.error('🚨 Error in getDonationTimeHour:', error.message);
    throw error;
  }
}



async function getRecipientDemandScore(orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    const recipientId = order.recipientId;
    const totalDonations = await Order.countDocuments({ recipientId, status: 'delivered' });
    const allOrders = await Order.countDocuments({ recipientId });
    console.log("Total donations:", totalDonations);
    return allOrders > 0 ? (totalDonations / allOrders) : 0; 
  } catch (error) {
    console.error('Error getting recipient demand score:', error.message);
    throw error;
  }
}

async function calculateDistance(fromLocation, toAddress) {
  // Placeholder; replace with a real geocoding API (e.g., Google Maps)
  return 1; 
}
async function getDistanceToRecipientKm(orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    return await calculateDistance(order.location, order.shippingAddress);
  } catch (error) {
    console.error('Error getting distance:', error.message);
    throw error;
  }
}
async function getStorageTypeRefrigerated(orderId) {
  try {
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order || !order.items.length) throw new Error('Order or items not found');
    const foodItem = order.items[0].productId;
    const storageRequirements = foodItem.storageRequirements?.toLowerCase() || '';
    return storageRequirements.includes('refrigerated') ? 1 : 0;
  } catch (error) {
    console.error('Error getting storage type refrigerated:', error.message);
    throw error;
  }
}
async function getStorageTypeRoomTemp(orderId) {
  try {
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order || !order.items.length) throw new Error('Order or items not found');
    const foodItem = order.items[0].productId;
    const storageRequirements = foodItem.storageRequirements?.toLowerCase() || '';
    return storageRequirements.includes('room') ? 1 : 0;
  } catch (error) {
    console.error('Error getting storage type room temp:', error.message);
    throw error;
  }
}
async function getFoodCategories(orderId) {
  try {
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order || !order.items.length) throw new Error('Order or items not found');
    const foodItem = order.items[0].productId;
    const category = foodItem.category?.toLowerCase() || '';

    const categories = {
      foodCategory_Dairy: 0,
      foodCategory_Fruits: 0,
      foodCategory_Meat: 0,
      foodCategory_PreparedMeals: 0,
      foodCategory_Vegetables: 0
    };

    if (category.includes('Dairy')) {
      categories.foodCategory_Dairy = 1;
    } else if (category.includes('Fruits')) {
      categories.foodCategory_Fruits = 1;
    } else if (category.includes('Meat')) {
      categories.foodCategory_Meat = 1;
    } else if (category.includes('Prepared')) {
      categories.foodCategory_PreparedMeals = 1;
    } else if (category.includes('Vegetables')) {
      categories.foodCategory_Vegetables = 1;
    }
    return [
      categories.foodCategory_Dairy,
      categories.foodCategory_Fruits,
      categories.foodCategory_Meat,
      categories.foodCategory_PreparedMeals,
      categories.foodCategory_Vegetables
    ];
  } catch (error) {
    console.error('Error getting food categories:', error.message);
    throw error;
  }
}

 async function getTransportationUrgency (orderId,productId) {
  try {

    const [
      expiryDaysLeft,
      orderedQuantity,
      donationTimeHour,
      recipientDemandScore,
      distanceToRecipientKm,
      storageTypeRefrigerated,
      storageTypeRoomTemp,
      foodCategories
    ] = await Promise.all([
      getExpiryDaysLeft(orderId, productId),
      getOrderedQuantity(orderId, productId),
      getDonationTimeHour(orderId, productId),
      getRecipientDemandScore(orderId),
      getDistanceToRecipientKm(orderId),
      getStorageTypeRefrigerated(orderId, productId),
      getStorageTypeRoomTemp(orderId, productId),
      getFoodCategories(orderId, productId)
    ]);

    const urgencyScore = await getPredictionUrgencyTransportation([
      expiryDaysLeft,
      orderedQuantity,
      donationTimeHour,
      recipientDemandScore,
      distanceToRecipientKm,
      storageTypeRefrigerated,
      storageTypeRoomTemp,
      ...foodCategories
    ]);

    return urgencyScore ;
  } catch (error) {
    console.error('Error calculating urgency transportation :', error.message);
    throw error;
}
}
