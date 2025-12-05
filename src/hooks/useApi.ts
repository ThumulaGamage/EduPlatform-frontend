// src/hooks/useApi.ts
import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T,>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiFunc: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await apiFunc();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      setState({ data: null, loading: false, error });
      throw err;
    }
  }, []);

  return { ...state, execute };
};

// Usage in component:
// const { data: users, loading, error, execute } = useApi<User[]>();
// useEffect(() => { execute(() => userService.getAll()); }, []);