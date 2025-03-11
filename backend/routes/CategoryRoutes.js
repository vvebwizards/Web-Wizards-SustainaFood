import express from "express";
import { addCategory,getCategories,deleteCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.post("/add",addCategory);
router.get("/getAll",getCategories);
router.delete("/deleteOne/:id",deleteCategory);


export default router;