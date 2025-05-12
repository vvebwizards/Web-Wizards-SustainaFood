import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/FoodReduce');
    console.log('MongoDB Connected');
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;
