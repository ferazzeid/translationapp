import { useState, useRef, useCallback } from 'react';

export interface AudioRecorderHook {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  error: string | null;
}

export const useAudioRecorder = (): AudioRecorderHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250); // Collect data every 250ms
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Error starting recording:', err);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            
            // Clean up
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            resolve(base64);
          };
          reader.readAsDataURL(audioBlob);
          
        } catch (err) {
          console.error('Error processing recording:', err);
          setError('Failed to process recording');
          setIsRecording(false);
          resolve(null);
        }
      };

      mediaRecorder.stop();
    });
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error
  };
};