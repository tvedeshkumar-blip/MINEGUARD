import { useState, useEffect } from 'react';
import type { AppRoute } from '../types';

export function useRouter() {
  const [route, setRoute] = useState<AppRoute>('/');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setRoute(hash as AppRoute);
    };

    // Initial load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: AppRoute) => {
    window.location.hash = path;
  };

  return { route, navigate };
}
