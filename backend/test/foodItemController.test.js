import supertest from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Added for token verification
import { app } from '../server.js';
import FoodItem from '../models/FoodItem.js';
import User from '../models/User.js';

const request = supertest(app);

describe('FoodItem Controller Tests', () => {
  let token; // Store JWT token
  let donorId; // Store donor ID

  // Initial setup: Create a test user once
  beforeAll(async () => {
    await User.deleteMany({});
    await FoodItem.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const testUser = new User({
      username: 'testdonor',
      email: 'donor@example.com',
      password: hashedPassword,
      role: 'donor',
      profileImage: 'https://foodreduce-backend.azurewebsites.net/../../frontend/src/assets/default_user_img.jpg',
      registeredDevices: [],
      blocked: false,
    });
    await testUser.save();
    donorId = testUser._id;
  });

  // Re-authenticate before each test to ensure a fresh token
  beforeEach(async () => {
    await FoodItem.deleteMany({});

    // Login to get a fresh token
    const loginResponse = await request
      .post('/api/auth/login')
      .set('User-Agent', 'Mozilla/5.0 (Test)') // Match signup device fingerprint
      .send({
        email: 'donor@example.com',
        password: 'password123',
        captchaToken: 'dummy-captcha-token',
      });

    console.log('Login Response:', loginResponse.body); // Debug login response
    token = loginResponse.body.user.token;
    if (!token) {
      throw new Error('Failed to get token from login');
    }

    // Verify token (optional debugging)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token Decoded:', decoded);
    } catch (err) {
      console.error('Token Verification Failed:', err.message);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should create a new food item', async () => {
    const response = await request
      .post('/api/foodItem/add')
      .set('Cookie', `token=${token}`) // Send fresh token as cookie
      .send({
        title: 'Apple',
        category: 'Fruits',
        quantity: 10,
        unit: 'kg',
        expirationDate: '2025-12-31',
      });

    console.log('Create Response:', response.status, response.body);
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Food item added successfully');
    expect(response.body.foodItem).toHaveProperty('title', 'Apple');
  });

  test('should get all food items', async () => {
    await request
      .post('/api/foodItem/add')
      .set('Cookie', `token=${token}`)
      .send({
        title: 'Apple',
        category: 'Fruits',
        quantity: 10,
        unit: 'kg',
        expirationDate: '2025-12-31',
      });

    const response = await request
      .get('/api/foodItem/getAll')
      .set('Cookie', `token=${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('title', 'Apple');
  });

  test('should update a food item', async () => {
    const foodItem = await request
      .post('/api/foodItem/add')
      .set('Cookie', `token=${token}`)
      .send({
        title: 'Orange',
        category: 'Fruits',
        quantity: 15,
        unit: 'kg',
        expirationDate: '2025-12-31',
      });

    const response = await request
      .put(`/api/foodItem/updateOne/${foodItem.body.foodItem._id}`)
      .set('Cookie', `token=${token}`)
      .send({
        title: 'Orange',
        category: 'Fruits',
        quantity: 25,
        unit: 'kg',
        expirationDate: '2025-12-31',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Food item updated successfully');
    expect(response.body.foodItem).toHaveProperty('quantity', 25);
  });

  test('should delete a food item', async () => {
    const foodItem = await request
      .post('/api/foodItem/add')
      .set('Cookie', `token=${token}`)
      .send({
        title: 'Grapes',
        category: 'Fruits',
        quantity: 30,
        unit: 'kg',
        expirationDate: '2025-12-31',
      });

    const response = await request
      .delete(`/api/foodItem/deleteOne/${foodItem.body.foodItem._id}`)
      .set('Cookie', `token=${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Food item deleted successfully');
  });

  test('should mark a food item as Pending Donation', async () => {
    const foodItem = await request
      .post('/api/foodItem/add')
      .set('Cookie', `token=${token}`)
      .send({
        title: 'Pear',
        category: 'Fruits',
        quantity: 20,
        unit: 'kg',
        expirationDate: '2025-12-31',
      });

    const response = await request
      .put(`/api/foodItem/donate/${foodItem.body.foodItem._id}`)
      .set('Cookie', `token=${token}`)
      .send({
        quantityToDonation: 20,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Item marked as Pending Donation');
    expect(response.body.foodItem).toHaveProperty('status', 'Pending Donation');
  });
});