import FoodItem from "../models/FoodItem.js";
import { getAuthenticatedUser } from "../utils/helpers.js";

import upload from "../middleware/multerConfig.js"; // Adjust the import path as needed

export async function addFoodItem(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err });
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

    
      const uploadedFile = req.files?.profileImage?.[0] || req.files?.imageUrl?.[0];

    
      const newFoodItem = new FoodItem({
        title,
        category,
        quantity,
        unit,
        expirationDate,
        nutritionalInfo,
        storageRequirements,
        notes,
        status: status || 'In Stock',
        donorId: donor._id,
        imageUrl: uploadedFile ? `/uploads/${uploadedFile.filename}` : null, d
      });


      const savedFoodItem = await newFoodItem.save();

      res.status(201).json({
        message: 'Food item added successfully',
        foodItem: savedFoodItem,
      });
    } catch (error) {
      console.error('Error adding food item:', error);
      res.status(500).json({ error: 'Error adding food item' });
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

export async function updateOne (req,res) {
    try {
        const { id } = req.params; 
        const updateData = req.body; 
        const user = await getAuthenticatedUser(req); 
        const donorId = user._id;
        const updatedItem = await FoodItem.findByIdAndUpdate(
           { _id: id, donorId: donorId },
          updateData,
          { new: true, runValidators: true }
        );
        if (!updatedItem) {
          return res.status(404).json({ error: 'Food item not found' });
        }
        res.status(200).json({ message: 'Food item updated successfully', foodItem: updatedItem });
      } catch (error) {
        console.error('Error updating food item:', error);
        res.status(500).json({ error: 'Error updating food item' });
      }
}