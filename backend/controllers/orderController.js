import { Order } from '../models/order.js';
import FoodItem from "../models/FoodItem.js";
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedUser } from "../utils/helpers.js";
import User from '../models/User.js'; 
import Donation from '../models/Donation.js';
import { getPredictionUrgencyTransportation,getOptimizedRouteClusters } from '../utils/predict.js';
export const createOrder = async (req, res) => {
  try {
    const { recipientId, location, items, userName, userEmail } = req.body;


    if (
      !recipientId ||
      !location ||
      !location.lat ||
      !location.lng ||
      !items ||
      !Array.isArray(items)
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let shippingAddress;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
      );
      const data = await response.json();

      if (data && data.address) {
        shippingAddress = {
          street: data.address.road || "Unknown Street",
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Unknown City",
          state: data.address.state || "Unknown State",
          zipCode: data.address.postcode || "Unknown Zip",
          country: data.address.country || "Unknown Country",
        };
      } else {
        throw new Error("Unable to retrieve address from coordinates");
      }
    } catch (geocodeError) {
      console.error("[REVERSE GEOCODING ERROR]", geocodeError);
      return res.status(400).json({ error: "Invalid location coordinates" });
    }

    const formattedItems = [];
    let totalAmount = 0;

    for (const { productId, orderedQuantity, name, imageUrl } of items) {
      const donationItem = await Donation.findById(productId);
      if (!donationItem) {
        return res.status(400).json({ error: `Invalid productId: ${productId}` });
      }

      donationItem.quantityToDonation = Math.max(
        donationItem.quantityToDonation - orderedQuantity,
        0
      );
      if (donationItem.quantityToDonation === 0) {
        donationItem.status = "Donated";

        const foodItem = await FoodItem.findById(donationItem.foodItemId);
        if (
          foodItem.status === "Pending Donation" &&
          donationItem.status === "Donated"
        ) {
          foodItem.status = "Donated";
          await foodItem.save();
        }
      }
      await donationItem.save();


      formattedItems.push({
        productId,
        name: name || donationItem.title || "Unknown Item", 
        orderedQuantity,
        imageUrl: imageUrl || donationItem.imageUrl,

      });
    }

    const order = new Order({
      orderNumber: uuidv4(),
      recipientId,
      location: {
        latitude: location.lat,
        longitude: location.lng,
      },
      items: formattedItems,
      status: "pending",
      totalAmount,
      customer: {
        name: userName,
        email: userEmail,
        phone: "26762772",
      },
      shippingAddress,
    });

    await order.save();

    res.status(201).json({ message: "Order submitted successfully", order });

    // Non-blocking urgency prediction
    (async () => {
      try {
        let updated = false;
        for (const item of order.items) {
          try {
            const urgencyScore = await getTransportationUrgency(
              order._id,
              item.productId,
              item.orderedQuantity
            );
            item.urgencyScore = urgencyScore;
            updated = true;
          } catch (e) {
            console.error('Urgency prediction failed:', e);
          }
        }
        if (updated) {
          await order.save();
        }
      } catch (e) {
        console.error('Non-blocking urgency prediction error:', e);
      }
    })();
  } catch (err) {
    console.error("[CREATE ORDER ERROR]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrdersByRecipient = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);

    const orders = await Order.find({ recipientId: user._id })
      .populate("items._id", "title imageUrl")  
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
    const orderedItem = order.items.find(item => item.productId.equals(productId));
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

function getHourFromTime(timeString) {
  if (!timeString) return 12; 
  const hour = parseInt(timeString.split(':')[0], 10);
  return isNaN(hour) ? 12 : hour;
}


export async function getDonationTimeHour(orderId, productId) {
  try {
    const order = await Order.findById(orderId);
  
    await order.populate('items.productId');
    const orderedItem = order.items.find(item => item.productId.equals(productId));
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

async function getTransportationUrgency(orderId, productId, orderedQuantity) {
  try {
    const [
      expiryDaysLeft,
      donationTimeHour,
      recipientDemandScore,
      distanceToRecipientKm,
      storageTypeRefrigerated,
      storageTypeRoomTemp,
      foodCategories
    ] = await Promise.all([
      getExpiryDaysLeft(orderId, productId),
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

    return urgencyScore;
  } catch (error) {
    console.error('Error calculating urgency transportation:', error.message);
    throw error;
  }
}

export const assignClustersToOrders = async (req, res) => {
  try {
    console.log("Request received for assigning clusters");

    const orders = await Order.find({
       status: 'shipped',
      "location.latitude": { $exists: true },
      "location.longitude": { $exists: true }
    });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders with location found." });
    }

    console.log(`Found ${orders.length} orders with location.`);

    const clusteredOrders = [];
    for (let order of orders) {
      const features = [order.location.latitude, order.location.longitude];
      const clusterLabel = await getOptimizedRouteClusters(features); 
      order.cluster = clusterLabel;
      await order.save();
      clusteredOrders.push(order);
    }

    const clusterGroups = {};
    const colors = ["blue", "red", "green"]; 

    clusteredOrders.forEach((order) => {
      const clusterLabel = order.cluster;
      if (!clusterGroups[clusterLabel]) {
        clusterGroups[clusterLabel] = {
          name: `Cluster ${clusterLabel + 1}`, 
          color: colors[clusterLabel], 
          orders: [],
        };
      }

      clusterGroups[clusterLabel].orders.push({
        id: order._id,
        lat: order.location.latitude,
        lng: order.location.longitude,
        name: order.name || `Order ${order._id}`,
      });
    });

    const formattedClusters = Object.values(clusterGroups);

    res.status(200).json({
      message: "Clusters assigned successfully",
      clusters: formattedClusters,
    });

  } catch (error) {
    console.error("Clustering error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDeliveryStatus = async (req, res) => {
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
}
