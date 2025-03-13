import FoodItem from "../models/FoodItem.js";
import { getAuthenticatedUser } from "../utils/helpers.js";
import { classifyFoodFreshness } from "../utils/roboflow.js";
import upload from "../middleware/multerConfig.js"; // Adjust the import path as needed

import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function addFoodItem(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      console.error("❌ Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }

    console.log("🔹 Uploaded Files:", req.files); // ✅ Debugging

    if (!req.files || !req.files.imageUrl) {
      console.error("❌ No image uploaded");
      return res.status(400).json({ error: "No image uploaded" });
    }

    try {
      const {
        title,
        category,
        quantity,
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

      let freshnessStatus = "N/A"; // Default value for non-perishable food

      // **Only use Roboflow if category is Fruits or Vegetables**
      if (["Fruits", "Vegetables"].includes(category)) {
        console.log("🖼 Sending image to Roboflow for freshness check...");

        // **Convert Image to Base64**
        const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

        // **Send to Roboflow API**
        const roboflowResponse = await axios.post(
          "https://detect.roboflow.com/freshness-detection-rhrze/3",
          imageBase64,
          {
            params: { api_key: "bQ3thOx4acHnOavJMXxJ" },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );

        console.log("✅ Roboflow Response:", roboflowResponse.data);

        // **Extract Freshness Result**
        const predictionClass = roboflowResponse.data?.predictions?.[0]?.class || "Unknown";

        // ✅ Extract only "Fresh" or "Rotten"
        freshnessStatus = predictionClass.toLowerCase().includes("rotten") ? "Rotten" : "Fresh";
      }

      // **Save in Database**
      const newFoodItem = new FoodItem({
        title,
        category,
        quantity,
        unit,
        expirationDate,
        nutritionalInfo,
        storageRequirements,
        notes,
        status: status || "In Stock",
        donorId: donor._id,
        imageUrl: `/uploads/${uploadedFile.filename}`,
        freshness: freshnessStatus, // ✅ Only "Fresh" or "Rotten" for Fruits & Vegetables
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
      if (quantityToDonation > foodItemToBeDonated.quantity) {
      return res.status(400).json({ error: 'Donation quantity cannot exceed available quantity' });
    }
    foodItemToBeDonated.quantityToDonation = Number(quantityToDonation);
    if (foodItemToBeDonated.quantityToDonation < foodItemToBeDonated.quantity) {

      foodItemToBeDonated.quantity -= foodItemToBeDonated.quantityToDonation;
    } else if (foodItemToBeDonated.quantityToDonation === foodItemToBeDonated.quantity) {
      foodItemToBeDonated.status = 'Pending Donation';
      foodItemToBeDonated.quantity = 0;
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

export async function toBedonatedFoodByDonor(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: No authenticated user found' });
    }
    const donorId = user._id;

    const donatedFoodItems = await FoodItem.find({ 
      status:'Pending Donation',
      donorId: donorId 
    });

    return res.status(200).json({ foodItems: donatedFoodItems });
  } catch (err) {
    console.error('Error fetching donated food items:', err);
    return res.status(500).json({ error: 'Internal server error while fetching donated food items' });
  }
}