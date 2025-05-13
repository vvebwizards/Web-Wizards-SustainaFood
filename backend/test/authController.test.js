import supertest from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { app } from '../server.js';
import FoodItem from '../models/FoodItem.js';
import User from '../models/User.js';

const request = supertest(app);

describe('FoodItem Controller Tests', () => {
  let token; 
  let donorId; 

  
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


  beforeEach(async () => {
    await FoodItem.deleteMany({});

    
    const loginResponse = await request
      .post('/api/auth/login')
      .set('User-Agent', 'Mozilla/5.0 (Test)') 
      .send({
        email: 'donor@example.com',
        password: 'password123',
        captchaToken: 'dummy-captcha-token',
      });

    console.log('Login Response:', loginResponse.status, loginResponse.body); 
    token = loginResponse.body.user.token;
    if (!token) {
      throw new Error('Failed to get token from login');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should create a new food item', async () => {
    const response = await request
      .post('/api/foodItem/add')
      .set('Cookie', `token=${token}`) 
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

    console.log('Get All Response:', response.status, response.body);
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

    console.log('Update Response:', response.status, response.body); 
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

    console.log('Delete Response:', response.status, response.body); 
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Food item deleted successfully');
  });
});