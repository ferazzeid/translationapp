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
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      startTimeRef.current = Date.now();
      
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
        mimeType: 'audio/wav'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms for better responsiveness
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

      // Check minimum recording duration (500ms minimum for better quality)
      const recordingDuration = Date.now() - startTimeRef.current;
      if (recordingDuration < 500) {
        console.log(`Recording too short: ${recordingDuration}ms, minimum 500ms required`);
        // Clean up and return null for short recordings
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setError('Recording too short, please speak for at least half a second');
        resolve(null);
        return;
      }

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
          
          // Additional check on blob size
          if (audioBlob.size < 1000) { // Less than 1KB is likely too short
            console.log(`Audio blob too small: ${audioBlob.size} bytes`);
            setError('Recording too short, please speak longer');
            setIsRecording(false);
            resolve(null);
            return;
          }
          
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