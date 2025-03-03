import FoodItem from "../models/FoodItem.js";

export async function addFoodItem (req,res) {
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
        
        });
        const savedFoodItem = await newFoodItem.save();
        res.status(201).json({
          message: 'Food item added successfully',
          foodItem: savedFoodItem
        });
      } catch (error) {
        console.error('Error adding food item:', error);
        res.status(500).json({ error: 'Error adding food item' });
      }
}

export async function getAll (req,res){
    try {
        const foodItems = await FoodItem.find();
        
        res.status(200).json(foodItems);
      } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ error: 'Error fetching food items' });
      }
}
   