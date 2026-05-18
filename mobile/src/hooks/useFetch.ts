import { useCallback, useEffect, useRef, useState } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  const aborted = useRef(false);

  const execute = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      if (!aborted.current) setState({ data, loading: false, error: null });
    } catch (e) {
      if (!aborted.current) setState({ data: null, loading: false, error: (e as Error).message });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    aborted.current = false;
    execute();
    return () => { aborted.current = true; };
  }, [execute]);

  return { ...state, refetch: execute };
}
