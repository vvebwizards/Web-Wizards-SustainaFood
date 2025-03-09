import FoodItem from '../models/FoodItem.js';
import { sendNotification } from '../socket/socket.js';
import cron from 'node-cron';

// Schedule the task to run daily at midnight
// If you want to change it to every 5 seconds use: '*/5 * * * * *' for validation or something
cron.schedule('0 0 * * *', () => {
    checkExpiredItems();
});

const checkExpiredItems = async () => {
    const today = new Date();
    today.setDate(today.getDate() - 1); // One day after expiration date
  
    const almostExpiredItems = await FoodItem.find({ expirationDate: { $eq: today } });
    const expiredItems = await FoodItem.find({ expirationDate: { $lt: today } });
  
    almostExpiredItems.forEach(item => {
      sendNotification(item.donorId, `Your food item "${item.title}" will expire in 1 day.`);
    });

    expiredItems.forEach(item => {
      sendNotification(item.donorId, `WARNING: Your food item "${item.title}" has expired.`);
    });
  };