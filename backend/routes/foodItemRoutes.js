import express from "express";
import { addFoodItem ,getAll} from "../controllers/foodItemController.js";

const router = express.Router();

router.post("/add",addFoodItem);
router.get("/getAll",getAll);

export default router;