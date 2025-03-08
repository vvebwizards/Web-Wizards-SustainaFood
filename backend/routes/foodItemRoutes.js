import express from "express";
import { addFoodItem ,getAll,deleteOne,updateOne,getToDonationFood} from "../controllers/foodItemController.js";

const router = express.Router();

router.post("/add",addFoodItem);
router.get("/getAll",getAll);
router.put("/updateOne/:id",updateOne);
router.delete("/deleteOne/:id",deleteOne);
router.get("/foodBank",getToDonationFood);

export default router;