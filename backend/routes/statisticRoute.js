import express from "express";
import { countDonationsByFoodItem ,totalDonationsByUnit,totalExpiredQuantityByUnit,averageShelfLifeBeforeDonation,getWastedVsDonatedRatio } from "../controllers/statisticsController.js";

const router = express.Router();
router.get("/countDonationsByFoodItem",countDonationsByFoodItem);
router.get("/countTotalDonations",totalDonationsByUnit);
router.get("/expiredQuantityByUnit", totalExpiredQuantityByUnit);
router.get("/averageShelfLife", averageShelfLifeBeforeDonation);
router.get('/wasteToDonationRatio', getWastedVsDonatedRatio);
export default router;