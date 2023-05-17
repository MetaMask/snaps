import { useState } from 'react';
import { makeAuthenticatedRequest } from '../utils';

export const useSnapRequest = () => {
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const makeRequest = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await makeAuthenticatedRequest();
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    result,
    error,
    makeRequest,
    isLoading,
  };
};
