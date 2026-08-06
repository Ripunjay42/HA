import { useEffect, useState } from 'react';
import { getAuthToken } from './apiClient';

// RN's <Image source={{uri, headers}}> unreliably attaches custom headers on
// Android, so authenticated endpoints (like staff documents) can render
// blank with no visible error. Fetching manually and converting to a data
// URI guarantees the Authorization header is actually sent.
export const useAuthedImage = (url) => {
  const [dataUri, setDataUri] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setDataUri(null);
    setError(false);

    fetch(url, { headers: { Authorization: `Bearer ${getAuthToken()}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load image');
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          }),
      )
      .then((uri) => {
        if (!cancelled) setDataUri(uri);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { dataUri, error };
};
