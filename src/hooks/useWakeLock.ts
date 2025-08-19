import { useState, useEffect, useCallback } from 'react';

interface WakeLockState {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
}

export const useWakeLock = (): WakeLockState => {
  const [isActive, setIsActive] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  const isSupported = 'wakeLock' in navigator;

  const request = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Wake Lock API is not supported in this browser');
      return false;
    }

    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      setIsActive(true);
      
      lock.addEventListener('release', () => {
        console.log('Wake lock was released');
        setIsActive(false);
        setWakeLock(null);
      });

      console.log('Wake lock is active');
      return true;
    } catch (err) {
      console.error('Failed to request wake lock:', err);
      return false;
    }
  }, [isSupported]);

  const release = useCallback(async (): Promise<void> => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        setIsActive(false);
        console.log('Wake lock released manually');
      } catch (err) {
        console.error('Failed to release wake lock:', err);
      }
    }
  }, [wakeLock]);

  // Auto-release on page visibility change (when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && wakeLock) {
        await release();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [wakeLock, release]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [wakeLock]);

  return {
    isSupported,
    isActive,
    request,
    release
  };
};