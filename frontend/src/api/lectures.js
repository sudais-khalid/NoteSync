import client from './client';

export async function summarizeTranscript(transcript, subject) {
  const { data } = await client.post('/summarize', { transcript, subject });
  return data;
}

export async function createLecture(payload) {
  const { data } = await client.post('/lectures', payload);
  return data;
}

export async function getLectures(params = {}) {
  const { data } = await client.get('/lectures', { params });
  return data;
}

export async function getLecture(id) {
  const { data } = await client.get(`/lectures/${id}`);
  return data;
}

export async function updateLecture(id, payload) {
  const { data } = await client.put(`/lectures/${id}`, payload);
  return data;
}

export async function deleteLecture(id) {
  const { data } = await client.delete(`/lectures/${id}`);
  return data;
}

export async function getCategoriesAndTags() {
  const { data } = await client.get('/lectures/stats/categories-tags');
  return data;
}
