const request = require('supertest');
const app = require('../../app');
const { connect, disconnect, clearDatabase } = require('./setup');

const VALID_USER = {
  fullName: 'Test Student',
  email: 'student@example.com',
  password: 'password123',
  university: 'Test University',
  fieldOfStudy: 'Computer Science',
  educationLevel: "Bachelor's",
};

beforeAll(connect);
afterAll(disconnect);
afterEach(clearDatabase);

describe('POST /api/auth/register', () => {
  test('creates a user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(VALID_USER);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe(VALID_USER.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  test('rejects missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(VALID_USER);
    const res = await request(app).post('/api/auth/register').send(VALID_USER);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already exists/i);
  });

  test('rejects short passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...VALID_USER, password: 'short' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(VALID_USER);
  });

  test('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: VALID_USER.email, password: VALID_USER.password });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
  });

  test('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: VALID_USER.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  test('rejects unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'password123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  test('returns the profile with a valid token', async () => {
    const reg = await request(app).post('/api/auth/register').send(VALID_USER);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(VALID_USER.email);
  });

  test('rejects requests without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('rejects a garbage token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});
