const request = require('supertest');
const app = require('../../app');
const { connect, disconnect, clearDatabase } = require('./setup');

const USER_A = {
  fullName: 'User A',
  email: 'a@example.com',
  password: 'password123',
  university: 'U',
  fieldOfStudy: 'CS',
  educationLevel: "Bachelor's",
};
const USER_B = { ...USER_A, email: 'b@example.com', fullName: 'User B' };

const LECTURE = {
  title: 'Newtonian Mechanics',
  subject: 'Physics',
  category: 'Physics',
  tags: ['mechanics'],
  transcript: 'Gravity is the force that attracts two bodies toward each other.',
  summary: 'A lecture about gravity.',
  keyPoints: ['Gravity attracts bodies'],
  sentiment: 'neutral',
  entitySpans: [{ text: 'Gravity', type: 'CONCEPT', start: 0, end: 7 }],
  keyTermSpans: [{ text: 'force', score: 2.5, start: 15, end: 20 }],
  enrichment: 'none',
};

let tokenA;
let tokenB;

beforeAll(connect);
afterAll(disconnect);

beforeEach(async () => {
  const a = await request(app).post('/api/auth/register').send(USER_A);
  const b = await request(app).post('/api/auth/register').send(USER_B);
  tokenA = a.body.token;
  tokenB = b.body.token;
});

afterEach(clearDatabase);

const asA = (req) => req.set('Authorization', `Bearer ${tokenA}`);
const asB = (req) => req.set('Authorization', `Bearer ${tokenB}`);

describe('POST /api/summarize', () => {
  test('runs the classical NLP pipeline and returns notes + annotations', async () => {
    const res = await asA(request(app).post('/api/summarize')).send({
      transcript:
        'Gravity is the force that attracts two bodies toward each other. Isaac Newton discovered gravity. Momentum is defined as mass times velocity.',
      subject: 'Physics',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.summary).toBe('string');
    expect(res.body.enrichment).toBe('none'); // no Gemini key in test env
    expect(Array.isArray(res.body.annotations.entitySpans)).toBe(true);
    expect(Array.isArray(res.body.annotations.keyTermSpans)).toBe(true);
    expect(Array.isArray(res.body.annotations.posSample)).toBe(true);
  });

  test('works WITHOUT a Gemini key (classical fallback, no 500)', async () => {
    // Regression guard: the old implementation hard-failed with 500 when
    // GEMINI_API_KEY was missing. The pipeline must succeed regardless.
    const res = await asA(request(app).post('/api/summarize')).send({
      transcript: 'Photosynthesis is the process plants use to convert light into energy.',
    });
    expect(res.status).toBe(200);
  });

  test('rejects empty transcript', async () => {
    const res = await asA(request(app).post('/api/summarize')).send({ transcript: '   ' });
    expect(res.status).toBe(400);
  });

  test('requires authentication', async () => {
    const res = await request(app).post('/api/summarize').send({ transcript: 'Some text.' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/lectures', () => {
  test('creates a lecture with annotation spans persisted', async () => {
    const res = await asA(request(app).post('/api/lectures')).send(LECTURE);
    expect(res.status).toBe(201);
    expect(res.body.lecture.title).toBe(LECTURE.title);
    expect(res.body.lecture.entitySpans).toHaveLength(1);
    expect(res.body.lecture.entitySpans[0].text).toBe('Gravity');
    expect(res.body.lecture.keyTermSpans[0].score).toBe(2.5);
    expect(res.body.lecture.enrichment).toBe('none');
  });

  test('rejects when required fields are missing', async () => {
    const res = await asA(request(app).post('/api/lectures')).send({ title: 'No transcript' });
    expect(res.status).toBe(400);
  });
});

describe('lecture ownership and isolation', () => {
  let lectureId;

  beforeEach(async () => {
    const res = await asA(request(app).post('/api/lectures')).send(LECTURE);
    lectureId = res.body.lecture._id;
  });

  test('owner can fetch their lecture with spans intact', async () => {
    const res = await asA(request(app).get(`/api/lectures/${lectureId}`));
    expect(res.status).toBe(200);
    expect(res.body.lecture.entitySpans[0].text).toBe('Gravity');
  });

  test("another user cannot fetch someone else's lecture", async () => {
    const res = await asB(request(app).get(`/api/lectures/${lectureId}`));
    expect(res.status).toBe(404);
  });

  test("another user cannot delete someone else's lecture", async () => {
    const res = await asB(request(app).delete(`/api/lectures/${lectureId}`));
    expect(res.status).toBe(404);
    const stillThere = await asA(request(app).get(`/api/lectures/${lectureId}`));
    expect(stillThere.status).toBe(200);
  });

  test('owner can delete their lecture', async () => {
    const res = await asA(request(app).delete(`/api/lectures/${lectureId}`));
    expect(res.status).toBe(200);
    const gone = await asA(request(app).get(`/api/lectures/${lectureId}`));
    expect(gone.status).toBe(404);
  });

  test('list only returns own lectures', async () => {
    await asB(request(app).post('/api/lectures')).send({ ...LECTURE, title: 'B lecture' });
    const listA = await asA(request(app).get('/api/lectures'));
    expect(listA.body.count).toBe(1);
    expect(listA.body.lectures[0].title).toBe(LECTURE.title);
  });
});

describe('GET /api/lectures filters and stats', () => {
  beforeEach(async () => {
    await asA(request(app).post('/api/lectures')).send(LECTURE);
    await asA(request(app).post('/api/lectures')).send({
      ...LECTURE,
      title: 'Cell Biology',
      category: 'Biology',
      tags: ['cells'],
    });
  });

  test('filters by category', async () => {
    const res = await asA(request(app).get('/api/lectures').query({ category: 'Biology' }));
    expect(res.body.count).toBe(1);
    expect(res.body.lectures[0].title).toBe('Cell Biology');
  });

  test('filters by tag', async () => {
    const res = await asA(request(app).get('/api/lectures').query({ tag: 'mechanics' }));
    expect(res.body.count).toBe(1);
    expect(res.body.lectures[0].title).toBe(LECTURE.title);
  });

  test('stats endpoint returns categories and tags with counts', async () => {
    const res = await asA(request(app).get('/api/lectures/stats/categories-tags'));
    expect(res.status).toBe(200);
    const categoryNames = res.body.categories.map((c) => c.name).sort();
    expect(categoryNames).toEqual(['Biology', 'Physics']);
  });
});
