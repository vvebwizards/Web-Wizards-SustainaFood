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
        quantityToDonation: Number(quantityToDonation),
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


export async function toBedonatedFoodByDonor(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: No authenticated user found' });
    }
    const donorId = user._id;

    const donatedFoodItems = await Donation.find({ 
      donorId: donorId 
    });

    return res.status(200).json({ foodItems: donatedFoodItems });
  } catch (err) {
    console.error('Error fetching donated food items:', err);
    return res.status(500).json({ error: 'Internal server error while fetching donated food items' });
  }
}

export async function removeFromDonation(req, res) {
  try {
    const { id } = req.params; 
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: No authenticated user found" });
    }
    const donorId = user._id;

    const foodItem = await FoodItem.findOne({ _id: id, donorId });
    if (!foodItem) {
      return res.status(404).json({ error: "Food item not found or you are not authorized to modify it" });
    }

    if (foodItem.status !== "Pending Donation") {
      return res.status(400).json({ error: "Only items with 'Pending Donation' status can be removed" });
    }

    const currentDate = new Date();
    const expirationDate = new Date(foodItem.expirationDate);

   
    if (currentDate > expirationDate) {
      foodItem.status = "Expired";
    } else {
      foodItem.status = "Damaged";
    }


    foodItem.quantityInStock += foodItem.quantityToDonation;
    foodItem.quantityToDonation = 0;

    foodItem.updatedAt = new Date();
    await foodItem.save();

    return res.status(200).json({
      message: `Item status updated to '${foodItem.status}' and removed from donation`,
      foodItem,
    });
  } catch (err) {
    console.error("Error removing item from donation:", err);
    return res.status(500).json({ error: "Internal server error while removing item from donation" });
  }
}