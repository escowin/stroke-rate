import { useState, useEffect } from 'react';
import type { TrainingSession } from '../types';

export const useSessionDuration = (session: TrainingSession | undefined) => {
  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    if (!session) {
      setDuration('');
      return;
    }

    const updateDuration = () => {
      const now = new Date();
      const startTime = session.startTime;
      const endTime = session.endTime || now;
      
      const diffMs = endTime.getTime() - startTime.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      
      const remainingSeconds = diffSeconds % 60;
      const remainingMinutes = diffMinutes % 60;
      
      let durationStr = '';
      
      if (diffHours > 0) {
        durationStr = `${diffHours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      } else {
        durationStr = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
      
      setDuration(durationStr);
    };

    // Update immediately
    updateDuration();

    // If session is active, update every second
    let interval: NodeJS.Timeout | null = null;
    if (session.isActive) {
      interval = setInterval(updateDuration, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [session]);

  return duration;
};
