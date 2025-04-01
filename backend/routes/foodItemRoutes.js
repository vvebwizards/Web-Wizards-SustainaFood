import express from "express";
import { addFoodItem ,getAll,deleteOne,updateOne,getToDonationFood,donate,toBedonatedFoodByDonor,predict_supply_demand} from "../controllers/foodItemController.js";

const router = express.Router();

router.post("/add",addFoodItem);
router.get("/getAll",getAll);
router.put("/updateOne/:id",updateOne);
router.delete("/deleteOne/:id",deleteOne);
router.get("/foodBank",getToDonationFood);
router.put("/donate/:id",donate);
router.get("/toBedonatedFoodByDonor",toBedonatedFoodByDonor);
router.post('/predict-quantity-requested', predict_supply_demand);
    
export default router;