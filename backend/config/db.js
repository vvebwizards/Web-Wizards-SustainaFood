import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017/FoodReduce';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

export default connectDB;




// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     await mongoose.connect('mongodb://localhost:27017/FoodReduce');
//     console.log('MongoDB Connected');
//   } catch (err) {
//     console.log(err);
//   }
// };

// export default connectDB;