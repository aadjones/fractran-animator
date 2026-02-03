import { useState, useEffect, useCallback } from 'react';

export function useHash(): [string, (hash: string) => void] {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handler = () => setHash(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((newHash: string) => {
    window.location.hash = newHash;
  }, []);

  return [hash, navigate];
}
