import express from "express";
import { addFoodItem ,getAll,deleteOne,updateOne,getToDonationFood,donate,toBedonatedFoodByDonor,cancelDonation,getFoodBank} from "../controllers/foodItemController.js";

const router = express.Router();

router.post("/add",addFoodItem);
router.get("/getAll",getAll);
router.put("/updateOne/:id",updateOne);
router.delete("/deleteOne/:id",deleteOne);
router.get("/foodBank",getFoodBank);
router.put("/donate/:id",donate);
router.get("/toBedonatedFoodByDonor",toBedonatedFoodByDonor);
router.put("/cancelDonation/:id", cancelDonation);
router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const foodItem = await FoodItem.findById(id);
      if (!foodItem) {
        return res.status(404).json({ error: "Food item not found" });
      }
      res.status(200).json(foodItem);
    } catch (error) {
      console.error("[GET FOOD BY ID ERROR]", error);
      res.status(500).json({ error: "Server error" });
    }
  });
export default router;