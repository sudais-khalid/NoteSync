import { useCallback, useEffect, useState } from 'react';
import * as lecturesApi from '../api/lectures';

export function useLecture(id) {
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await lecturesApi.getLecture(id);
      setLecture(data.lecture);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load this lecture.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { lecture, loading, error, refetch };
}
