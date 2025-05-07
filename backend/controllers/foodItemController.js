import FoodItem from "../models/FoodItem.js";
import { getAuthenticatedUser } from "../utils/helpers.js";
import upload from "../middleware/multerConfig.js"; 
import { sendNotification } from "../socket/socket.js"
import User from "../models/User.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Donation  from "../models/Donation.js";
import cron from 'node-cron';
import { getPrediction } from '../utils/predict.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export async function addFoodItem(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      console.error("❌ Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }

    console.log("🔹 Uploaded Files:", req.files);

    if (!req.files || !req.files.imageUrl) {
      console.error("❌ No image uploaded");
      return res.status(400).json({ error: "No image uploaded" });
    }

    try {
      const {
        title,
        category,
        quantityInStock,
        unit,
        expirationDate,
        nutritionalInfo,
        storageRequirements,
        notes,
        status,
      } = req.body;

      const donor = await getAuthenticatedUser(req);
      if (!donor) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const uploadedFile = req.files.imageUrl[0];
      const imagePath = path.join(__dirname, "..", "uploads", uploadedFile.filename);

      let freshnessStatus = "N/A"; 

      
      if (["Fruits", "Vegetables"].includes(category)) {
        console.log("🖼 Sending image to Roboflow for freshness check...");

        const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

        
        const roboflowResponse = await axios.post(
          "https://detect.roboflow.com/freshness-detection-rhrze/3",
          imageBase64,
          {
            params: { api_key: "gvgPfyypMFK52lNz1UE2" },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );

        console.log("✅ Roboflow Response:", roboflowResponse.data);

       
        const predictionClass = roboflowResponse.data?.predictions?.[0]?.class || "Unknown";

       
        freshnessStatus = predictionClass.toLowerCase().includes("rotten") ? "Rotten" : "Fresh";

      
        if (freshnessStatus === "Rotten") {
          console.error("❌ Food item detected as rotten, cannot be donated.");
  const adminUsers = await User.find({ role: "admin" });
  
  adminUsers.forEach(async (admin) => {
    await sendNotification(
      admin._id,
      `User ${donor.username} tried to donate rotten food: "${title}"`,
     
    );
  });

          return res.status(400).json({ error: "Food item is rotten and can't be donated." });
        }
      }

      const newFoodItem = new FoodItem({
        title,
        category,
        quantityInStock,
        unit,
        expirationDate,
        nutritionalInfo,
        storageRequirements,
        notes,
        status: status || "In Stock",
        donorId: donor._id,
        imageUrl: `/uploads/${uploadedFile.filename}`,
        freshness: freshnessStatus, 
      });

      const savedFoodItem = await newFoodItem.save();
      console.log("✅ Food item added successfully:", savedFoodItem);

      res.status(201).json({
        message: "Food item added successfully",
        foodItem: savedFoodItem,
      });
    } catch (error) {
      console.error("❌ Error adding food item:", error);
      res.status(500).json({ error: error.message || "Error adding food item" });
    }
  });
}




export async function getAll (req,res){
    try {
        const user = await getAuthenticatedUser(req); 
        const donorId = user._id;
        const foodItems = await FoodItem.find({donorId:donorId});
        
        res.status(200).json(foodItems);
      } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ error: 'Error fetching food items' });
      }
      
}

export async function getFoodBank (req,res){
  try {
      const user = await getAuthenticatedUser(req); 
      const donorId = user._id;
      const foodItems = await Donation.find();
      
      res.status(200).json(foodItems);
    } catch (error) {
      console.error('Error fetching food items:', error);
      res.status(500).json({ error: 'Error fetching food items' });
    }
    
}
export async function deleteOne (req,res) {
  try {
      const { id } = req.params; 
      const user = await getAuthenticatedUser(req); 
      const donorId = user._id;
      const deletedItem = await FoodItem.findOneAndDelete({ _id: id, donorId: donorId });

      if (!deletedItem) {
        return res.status(404).json({ error: 'Food item not found' });
      }
      res.status(200).json({ message: 'Food item deleted successfully' });
    } catch (error) {
      console.error('Error deleting food item:', error);
      res.status(500).json({ error: 'Error deleting food item' });
    }
}

export async function updateOne(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err });
    }

    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = await getAuthenticatedUser(req);
      const donorId = user._id;
      const uploadedFile = req.files?.profileImage?.[0] || req.files?.imageUrl?.[0];
      if (uploadedFile) {
        updateData.imageUrl = `/uploads/${uploadedFile.filename}`;
      }
      const updatedItem = await FoodItem.findOneAndUpdate(
        { _id: id, donorId: donorId }, 
        updateData,                   
        { new: true, runValidators: true } 
      );
      if (!updatedItem) {
        return res.status(404).json({ error: 'Food item not found' });
      }
      res.status(200).json({
        message: 'Food item updated successfully',
        foodItem: updatedItem,
      });
    } catch (error) {
      console.error('Error updating food item:', error);
      res.status(500).json({ error: 'Error updating food item' });
    }
  });
}



export async function getToDonationFood(req, res) {
  try {
    const toDonationFood = await FoodItem.find({ status: 'Pending Donation' })
      .populate('donorId', 'username'); 
       res.status(200).json(toDonationFood);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ error: 'Error fetching food items' });
  }
}

export async function donate(req, res) {
  try {
    const { id } = req.params;
    const user = await getAuthenticatedUser(req);
    const donorId = user._id;

    const foodItemToBeDonated = await FoodItem.findOne({ _id: id, donorId: donorId });
    if (!foodItemToBeDonated) {
      return res.status(404).json({ error: 'Food item not found or you are not authorized to donate it' });
    }

    if (foodItemToBeDonated.status !== 'In Stock') {
      return res.status(400).json({ error: 'Only items In Stock can be donated' });
    }

    const { quantityToDonation } = req.body;

    if (quantityToDonation > foodItemToBeDonated.quantityInStock) {
      return res.status(400).json({ error: 'Donation quantity cannot exceed available quantity' });
    }

    foodItemToBeDonated.quantityToDonation = (foodItemToBeDonated.quantityToDonation || 0) + Number(quantityToDonation);
    foodItemToBeDonated.quantityInStock -= quantityToDonation;

    if (foodItemToBeDonated.quantityInStock === 0) {
      foodItemToBeDonated.status = 'Pending Donation';
    }

    let existingDonation = await Donation.findOne({
      foodItemId: foodItemToBeDonated._id,
      donorId: donorId,
      status: 'Pending Donation',
    });

    if (existingDonation) {
    
      existingDonation.quantityToDonation += Number(quantityToDonation);
      await existingDonation.save();
    } else {
    
      const newDonation = new Donation({
        foodItemId: foodItemToBeDonated._id,
        title: foodItemToBeDonated.title,
        imageUrl: foodItemToBeDonated.imageUrl,
        quantityToDonation: Number(quantityToDonation),
        category: foodItemToBeDonated.category,
        expirationDate: foodItemToBeDonated.expirationDate,
        unit: foodItemToBeDonated.unit,
        status: 'Pending Donation',
        donorId: donorId,
      });
      await newDonation.save();
    }

    await foodItemToBeDonated.save();

    const message = foodItemToBeDonated.status === 'Pending Donation'
      ? 'Item marked as Pending Donation'
      : 'Partial donation processed';

    return res.status(200).json({ message, foodItem: foodItemToBeDonated });
  } catch (err) {
    console.error('Error updating food item status:', err);
    return res.status(500).json({ error: 'Internal server error while updating food item status' });
  }
}


async function handleDonationFetchByStatus(req, res, status) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: No authenticated user found' });
    }

    const foodItems = await Donation.find({ donorId: user._id, status });
    return res.status(200).json({ foodItems });
  } catch (err) {
    console.error(`Error fetching ${status} items:`, err);
    return res.status(500).json({ error: `Internal server error while fetching ${status} items` });
  }
}
export function toBedonatedFoodByDonor(req, res) {
  return handleDonationFetchByStatus(req, res, 'Pending Donation');
}

export function donatedFoodByDonor(req, res) {
  return handleDonationFetchByStatus(req, res, 'Donated');
}


export async function cancelDonation(req, res) {
  try {
    const { id } = req.params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: No authenticated user found" });
    }
    const donorId = user._id;

    const ToDonation = await Donation.findOne({ _id: id, donorId });
    if (!ToDonation) {
      return res.status(404).json({ error: "Donation not found or you are not authorized to modify it" });
    }

    const currentDate = new Date();
    const expirationDate = new Date(ToDonation.expirationDate);

    if (currentDate > expirationDate) {
      ToDonation.status = "Expired";
      await ToDonation.save();
    } else {
      await Donation.deleteOne({ _id: id, donorId });
    }

    const foodItem = await FoodItem.findById(ToDonation.foodItemId);
    if (foodItem) {
      foodItem.quantityToDonation = 0;
      foodItem.quantityInStock += ToDonation.quantityToDonation;

      if (foodItem.status === "Pending Donation") {
        foodItem.status = "In Stock";
      }

      foodItem.updatedAt = new Date();
      await foodItem.save();
    } else {
      console.warn("Food item not found. Donation was still removed.");
    }

    return res.status(200).json({
      message: "Item removed from donation",
      ...(foodItem ? { foodItem } : {}),
    });
  } catch (err) {
    console.error("Error removing item from donation:", err);
    return res.status(500).json({ error: "Internal server error while removing item from donation" });
  }
}



cron.schedule('0 0 * * *', async () => {
  console.log('Checking for expired food items...');
  const currentDate = new Date().toISOString().split('T')[0];
  console.log('Current date:', currentDate);

  try {
    const foodItemsToExpire = await FoodItem.find({ expirationDate: currentDate, status: { $ne: 'Expired' } });
    if (foodItemsToExpire.length === 0) {
      console.log('No food items to expire.');
      return;
    }
    const foodItemIds = foodItemsToExpire.map(item => item._id);
    const updatedFoodItems = await FoodItem.updateMany(
      { _id: { $in: foodItemIds } },
      { status: 'Expired' }
    );
    console.log(`${updatedFoodItems.modifiedCount || updatedFoodItems.nModified} food items marked as expired.`);
    const updatedDonations = await Donation.updateMany(
      { foodItemId: { $in: foodItemIds } },
      { status: 'Expired' }
    );
    console.log(`${updatedDonations.modifiedCount || updatedDonations.nModified} donations marked as expired.`);
  } catch (error) {
    console.error('Error updating food items and donations:', error);
  }
});
async function getDonationDataInRange(foodItem, startDate, endDate, donorId) {
  const donations = await Donation.find({
    donorId,
    title: foodItem,
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  });

  const totalDonations = donations.reduce((sum, d) => sum + (d.quantityToDonation || 0), 0);
  const avgQuantity = donations.length > 0 ? totalDonations / donations.length : 0;

  return { avgQuantity };
}


export async function predictQuantityRequested(avgQuantity, avgWasteRate) {
  const prediction = await getPrediction([avgQuantity, avgWasteRate]);
  
  return prediction;  
}

async function getFoodWasteData(donorId, foodItem, startDate, endDate) {
  const foodItems = await FoodItem.find({
    donorId,
    title: foodItem,
    status: { $in: ['Expired', 'Damaged'] },
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const donations = await Donation.find({
    donorId,
    title: foodItem,
    status: { $in: ['Expired', 'Damaged'] },
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const wastedFromFoodItems = foodItems.reduce((sum, item) => sum + (item.quantityInStock || 0), 0);
  const wastedFromDonations = donations.reduce((sum, item) => sum + (item.quantityToDonation || 0), 0);

  const totalWaste = wastedFromFoodItems + wastedFromDonations;
  console.log(`Wasted from food items: ${wastedFromFoodItems}, Wasted from donations: ${wastedFromDonations}, Total waste: ${totalWaste}`);

  return {
    wastedFromFoodItems,
    wastedFromDonations,
    totalWaste
  };
}

export async function predictSupplyDemand(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const donorId = user._id;

    const { foodItem, startDate, endDate } = req.body;
    if (!foodItem || !startDate || !endDate) {
      console.warn("Missing fields:", { foodItem, startDate, endDate });
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Starting prediction for user:", donorId);
    console.log("Inputs received:", { foodItem, startDate, endDate });

    const { avgQuantity } = await getDonationDataInRange(foodItem, startDate, endDate, donorId);

    if (avgQuantity === 0) {
      console.log("No donation data found in the given time range.");
      return res.status(400).json({ error: "No donation data found in the given time range." });
    }

    const { totalWaste } = await getFoodWasteData(donorId, foodItem, startDate, endDate);

    if (totalWaste === 0) {
      console.log("Prediction unavailable: no food waste recorded for the specified period.");
      return res.status(422).json({
        error: "Prediction unavailable: no food waste recorded for the specified period."
      });
    }

    const avgWasteRate = totalWaste / avgQuantity;
    const predictedQuantityKg = await predictQuantityRequested(avgQuantity, avgWasteRate);

    console.log("Predicted quantity requested:", predictedQuantityKg);
    console.log("Average donation quantity:", avgQuantity);
    console.log("Average food waste rate:", avgWasteRate);

    res.status(200).json({
      message: "Prediction successful",
      avgDonationQuantity: avgQuantity,
      predictedQuantityRequested: predictedQuantityKg,
      avgFoodWasteRate: avgWasteRate
    });

  } catch (error) {
    console.error("Error predicting supply-demand:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
      headers: req.headers,
    });
    res.status(500).json({ error: "Internal server error" });
  }
}
