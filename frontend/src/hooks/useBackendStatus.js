// hooks/useBackendStatus.js
import { useState, useEffect } from 'react';

const useBackendStatus = () => {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const wakeUpBackend = async () => {
      const maxRetries = 10;
      let retryCount = 0;

      const checkBackend = async () => {
        try {
          const response = await fetch('https://kartmart.onrender.com/api/health', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setIsBackendReady(true);
              return;
            }
          }
          
          throw new Error('Backend not ready');
        } catch (error) {
          retryCount++;
          console.log(`Backend wake-up attempt ${retryCount}/${maxRetries}`);
          
          if (retryCount >= maxRetries) {
            setError('Failed to connect to backend after multiple attempts');
            return;
          }

          // Exponential backoff: 2s, 4s, 6s, 8s, then 5s intervals
          const delay = retryCount <= 4 ? retryCount * 2000 : 5000;
          setTimeout(checkBackend, delay);
        }
      };

      checkBackend();
    };

    wakeUpBackend();
  }, []);

  return { isBackendReady, error };
};

export default useBackendStatus;
