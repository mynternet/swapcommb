// __tests__/registration.test.js
const request = require('supertest');
const app = require('./app');

describe('User Registration', () => {
  it('should register a new user', async () => {
    const newUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/register')
      .send(newUser)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'User registered successfully.');
  });

  it('should return an error for missing fields', async () => {
    const incompleteUser = {
      username: 'testuser',
      email: 'test@example.com',
    };

    const response = await request(app)
      .post('/register')
      .send(incompleteUser)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Please provide all required fields.');
  });

  it('should return an error for duplicate email', async () => {
    const duplicateUser = {
      username: 'existinguser',
      email: 'test@example.com', // Already registered in the first test
      password: 'password123',
    };

    const response = await request(app)
      .post('/register')
      .send(duplicateUser)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Email already registered.');
  });
});

