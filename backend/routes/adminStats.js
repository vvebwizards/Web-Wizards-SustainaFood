// backend/api/adminStats.js
import express from 'express';
import * as statsService from '../services/statsService.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const [
      userMetrics,
      categoryMetrics,
      foodItemMetrics,
      donationMetrics,
      orderMetrics,
      notificationMetrics,
      settingsMetrics,
      donationsByCategory,
      topDonors,
      avgDonationSize,
      ordersByLocation,
      stockVsDonation,
      expiryConversion
    ] = await Promise.all([
      statsService.getUserMetrics(),
      statsService.getCategoryMetrics(),
      statsService.getFoodItemMetrics(),
      statsService.getDonationMetrics(),
      statsService.getOrderMetrics(),
      statsService.getNotificationMetrics(),
      statsService.getSettingsMetrics(),
      statsService.getDonationsByCategory(),
      statsService.getTopDonors(),
      statsService.getAverageDonationSizePerItem(),
      statsService.getOrdersByLocation(),
      statsService.getStockVsDonationRatio(),
      statsService.getExpiryConversionRate()
    ]);

    res.json({
      userMetrics,
      categoryMetrics,
      foodItemMetrics,
      donationMetrics,
      orderMetrics,
      notificationMetrics,
      settingsMetrics,
      donationsByCategory,
      topDonors,
      avgDonationSize,
      ordersByLocation,
      stockVsDonation,
      expiryConversion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
