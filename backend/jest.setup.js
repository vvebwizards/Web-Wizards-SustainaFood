import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

beforeAll(async () => {
  console.log(`[${new Date().toISOString()}] Disconnecting existing Mongoose connections...`);
  await mongoose.disconnect();

  console.log(`[${new Date().toISOString()}] Starting MongoMemoryServer...`);
  mongoServer = await MongoMemoryServer.create();
  console.log(`[${new Date().toISOString()}] MongoMemoryServer started, connecting to Mongoose...`);
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log(`[${new Date().toISOString()}] Mongoose connected`);
}, 30000);

afterAll(async () => {
  console.log(`[${new Date().toISOString()}] Disconnecting Mongoose...`);
  await mongoose.disconnect();
  console.log(`[${new Date().toISOString()}] Stopping MongoMemoryServer...`);
  await mongoServer.stop();
  console.log(`[${new Date().toISOString()}] Mongoose disconnected and MongoMemoryServer stopped`);
});

export {};