import Category from "../models/Category.js";
import { getAuthenticatedUser } from "../utils/helpers.js";

export async function getCategories(req, res) {
  try {
    const user = await getAuthenticatedUser(req); 
    const donorId = user._id;
    const categories = await Category.find({ donorId });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ error: "Error fetching categories" });
  }
}

export async function addCategory(req, res) {
  try {
    const { name } = req.body;
    const user = await getAuthenticatedUser(req); 
    const donorId = user._id;

    const existingCategory = await Category.findOne({ name, donorId });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists for this donor" });
    }
    
    const category = new Category({ name, donorId });
    await category.save();

    res.status(201).json({ message: "Category added successfully", category });
  } catch (error) {
    console.error("Error adding category:", error.message);
    res.status(500).json({ error: "Error adding category" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const user = await getAuthenticatedUser(req); 
    const donorId = user._id;

    const deletedCategory = await Category.findOneAndDelete({ _id: id, donorId: donorId});
    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found or not owned by this donor" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(500).json({ error: "Error deleting category" });
  }
}

