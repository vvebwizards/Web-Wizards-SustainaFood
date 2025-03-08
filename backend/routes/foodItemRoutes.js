import express from "express";
import { addFoodItem ,getAll,deleteOne,updateOne,getToDonationFood,donate,toBedonatedFoodByDonor} from "../controllers/foodItemController.js";

const router = express.Router();

router.post("/add",addFoodItem);
router.get("/getAll",getAll);
router.put("/updateOne/:id",updateOne);
router.delete("/deleteOne/:id",deleteOne);
router.get("/foodBank",getToDonationFood);
router.put("/donate/:id",donate);
router.get("/toBedonatedFoodByDonor",toBedonatedFoodByDonor);
export default router;