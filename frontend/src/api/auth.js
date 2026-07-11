import client from './client';

export async function register(payload) {
  const { data } = await client.post('/auth/register', payload);
  return data;
}

export async function login(payload) {
  const { data } = await client.post('/auth/login', payload);
  return data;
}

export async function getMe() {
  const { data } = await client.get('/auth/me');
  return data;
}

export async function updateProfile(payload) {
  const { data } = await client.put('/auth/profile', payload);
  return data;
}

export async function changePassword(payload) {
  const { data } = await client.put('/auth/change-password', payload);
  return data;
}
