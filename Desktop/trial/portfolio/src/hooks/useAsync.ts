import { type DependencyList, useEffect, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>(factory: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: null });

    factory()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (active) setState({ data: null, loading: false, error: error instanceof Error ? error.message : "Request failed" });
      });

    return () => {
      active = false;
    };
  // The caller owns the dependency list, mirroring React's built-in effect hooks.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
