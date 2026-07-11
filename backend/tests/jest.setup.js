// Test environment must be deterministic: no Gemini enrichment (classical
// pipeline only) and a fixed JWT secret, regardless of any local .env that
// a shell wrapper may have injected.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
delete process.env.GEMINI_API_KEY;
delete process.env.MONGODB_URI;
