import FoodItem from '../models/FoodItem.js';
import Settings from '../models/Settings.js';
import { sendNotification } from '../socket/socket.js';
import cron from 'node-cron';

let cronJobs = {};

const setupUserCronJobs = async () => {
    try {
        const settingsList = await Settings.find({}).populate('userId', '_id');

        Object.values(cronJobs).forEach(job => job.stop());
        cronJobs = {};

        settingsList.forEach(settings => {
            const { userId, expiredNotifHour, expiredNotifMinute, expiredNotifDate } = settings;

            if (expiredNotifHour !== undefined && expiredNotifMinute !== undefined && expiredNotifDate !== undefined) {
                const cronTime = `${expiredNotifMinute} ${expiredNotifHour} * * *`;
                cronJobs[userId] = cron.schedule(cronTime, () => {
                    checkUserExpiredItems(userId, expiredNotifDate);
                });
            }
        });
    } catch (error) {
        console.error("Error setting up user cron jobs:", error);
    }
};

const checkUserExpiredItems = async (userId, daysBeforeExpiration) => {
    try {
        const today = new Date();
        today.setDate(today.getDate() - Number(daysBeforeExpiration));
        
        const almostExpiredItems = await FoodItem.find({ donorId: userId, expirationDate: { $eq: today } });
        const expiredItems = await FoodItem.find({ donorId: userId, expirationDate: { $lt: today } });

        almostExpiredItems.forEach(item => {
            sendNotification(userId, `Your food item "${item.title}" will expire in ${daysBeforeExpiration} days.`);
        });

        expiredItems.forEach(item => {
            sendNotification(userId, `WARNING: Your food item "${item.title}" has expired.`);
        });
    } catch (error) {
        console.error(`Error checking expired items for user ${userId}:`, error);
    }
};
 
setupUserCronJobs();

export const refreshUserCronJobs = setupUserCronJobs;
