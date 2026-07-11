import { useCallback, useEffect, useState } from 'react';
import * as lecturesApi from '../api/lectures';

export function useLectures({ category, tag } = {}) {
  const [lectures, setLectures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [lecturesData, statsData] = await Promise.all([
        lecturesApi.getLectures({ category, tag }),
        lecturesApi.getCategoriesAndTags(),
      ]);
      setLectures(lecturesData.lectures);
      setCategories(statsData.categories);
      setTags(statsData.tags);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load your lectures.');
    } finally {
      setLoading(false);
    }
  }, [category, tag]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const removeLecture = useCallback(async (id) => {
    await lecturesApi.deleteLecture(id);
    setLectures((prev) => prev.filter((l) => l._id !== id));
  }, []);

  return { lectures, categories, tags, loading, error, refetch, removeLecture };
}
