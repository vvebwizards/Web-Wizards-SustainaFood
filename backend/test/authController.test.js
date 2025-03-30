import supertest from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Added bcrypt import
import User from '../models/User.js';
import { app } from '../server.js';

const request = supertest(app);

describe('Auth Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({}); // Clear database before each test
  });

  afterAll(async () => {
    await mongoose.connection.close(); // Single cleanup after all tests
  });

  describe('Signup tests', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'donor',
      };

      const res = await request
        .post('/api/auth/signup')
        .set('User-Agent', 'Mozilla/5.0 (Test)')
        .send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully.');

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('testuser');
      expect(user.role).toBe('donor');
    });

    it('should fail if email is already in use', async () => {
      const existingUser = new User({
        username: 'existinguser',
        email: 'test@example.com',
        password: 'hashedpassword', // Note: This should be hashed in real use
        role: 'donor',
      });
      await existingUser.save();

      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'donor',
      };

      const res = await request.post('/api/auth/signup').send(newUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email is already in use.');
    });

    it('should fail if username is already taken', async () => {
      const existingUser = new User({
        username: 'testuser',
        email: 'existing@example.com',
        password: 'hashedpassword', // Note: This should be hashed
        role: 'donor',
      });
      await existingUser.save();

      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'donor',
      };

      const res = await request.post('/api/auth/signup').send(newUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Username is already taken.');
    });

    it('should fail if password is less than 6 characters', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'pass',
        role: 'donor',
      };

      const res = await request.post('/api/auth/signup').send(newUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Password must be at least 6 characters long.');
    });

    it('should fail if required fields are missing', async () => {
      const incompleteUser = {
        email: 'test@example.com',
        password: 'password123',
      };

      const res = await request.post('/api/auth/signup').send(incompleteUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('All fields are required.');
    });
  });

  describe('Login tests', () => {
    let testUser;

    beforeEach(async () => {
      // Note: This beforeEach is nested, so it runs in addition to the outer one
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'donor',
        profileImage: 'http://localhost:5000/../../frontend/src/assets/default_user_img.jpg',
        registeredDevices: [],
        blocked: false,
      });
      await testUser.save();
    });

    it('should log in a user successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        captchaToken: 'dummy-captcha-token',
      };

      const res = await request
        .post('/api/auth/login')
        .set('User-Agent', 'Mozilla/5.0 (Test)')
        .send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.role).toBe('donor');
      expect(res.body.user.token).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail if email is missing', async () => {
      const loginData = {
        password: 'password123',
        captchaToken: 'dummy-captcha-token',
      };

      const res = await request.post('/api/auth/login').send(loginData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email, password, and captcha are required');
    });

    it('should fail if password is missing', async () => {
      const loginData = {
        email: 'test@example.com',
        captchaToken: 'dummy-captcha-token',
      };

      const res = await request.post('/api/auth/login').send(loginData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email, password, and captcha are required');
    });

    it('should fail if captchaToken is missing', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const res = await request.post('/api/auth/login').send(loginData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email, password, and captcha are required');
    });

    it('should fail if email does not exist', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
        captchaToken: 'dummy-captcha-token',
      };

      const res = await request.post('/api/auth/login').send(loginData);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should fail if password is incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
        captchaToken: 'dummy-captcha-token',
      };

      const res = await request.post('/api/auth/login').send(loginData);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should fail if user is blocked', async () => {
      await User.updateOne({ email: 'test@example.com' }, { blocked: true });

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        captchaToken: 'dummy-captcha-token',
      };

      const res = await request.post('/api/auth/login').send(loginData);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Your account has been blocked');
    });
  });
});