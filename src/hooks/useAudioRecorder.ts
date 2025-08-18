import { useState, useRef, useCallback } from 'react';

export interface AudioRecorderHook {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  error: string | null;
}

// Utility function to detect best audio format for the browser
const getSupportedAudioFormat = (): { mimeType: string; extension: string } => {
  // Test formats in order of preference for speech-to-text compatibility
  const formats = [
    { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
    { mimeType: 'audio/webm', extension: 'webm' },
    { mimeType: 'audio/mp4', extension: 'm4a' },
    { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
    { mimeType: 'audio/wav', extension: 'wav' }
  ];

  console.log('Testing MediaRecorder format support...');
  for (const format of formats) {
    const isSupported = MediaRecorder.isTypeSupported(format.mimeType);
    console.log(`${format.mimeType}: ${isSupported ? 'SUPPORTED' : 'NOT SUPPORTED'}`);
    if (isSupported) {
      console.log(`Selected format: ${format.mimeType}`);
      return format;
    }
  }
  
  // If no specific format is supported, return empty to let browser choose
  console.log('No specific format supported, using browser default');
  return { mimeType: '', extension: 'webm' };
};

// Enhanced base64 conversion with chunking to prevent stack overflow
const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert audio to base64'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(blob);
    } catch (error) {
      reject(error);
    }
  });
};

export const useAudioRecorder = (): AudioRecorderHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      startTimeRef.current = Date.now();
      
      // Get user media with optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Lower sample rate for better compatibility
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      
      // Get the best supported audio format for this browser
      const audioFormat = getSupportedAudioFormat();
      console.log('Using audio format:', audioFormat);

      let mediaRecorder: MediaRecorder;
      
      // Create MediaRecorder with or without mimeType based on support
      if (audioFormat.mimeType) {
        try {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: audioFormat.mimeType
          });
          console.log(`MediaRecorder created with ${audioFormat.mimeType}`);
        } catch (formatError) {
          console.log(`Failed with ${audioFormat.mimeType}, trying without mimeType:`, formatError);
          mediaRecorder = new MediaRecorder(stream);
        }
      } else {
        // No mimeType - let browser choose
        mediaRecorder = new MediaRecorder(stream);
        console.log('MediaRecorder created with browser default format');
      }

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed - microphone error');
        setIsRecording(false);
      };

      mediaRecorder.start(250); // Collect data every 250ms for good balance
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Error starting recording:', err);
      
      // Clean up stream if it was created
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      // Immediately set recording to false to prevent button stuck state
      setIsRecording(false);
      
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        // Clean up stream if it exists
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        resolve(null);
        return;
      }

      // Check minimum recording duration (300ms minimum for responsiveness)
      const recordingDuration = Date.now() - startTimeRef.current;
      if (recordingDuration < 300) {
        console.log(`Recording too short: ${recordingDuration}ms, minimum 300ms required`);
        // Clean up and return null for short recordings
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setError('Recording too short, please speak for at least a moment');
        resolve(null);
        return;
      }

      mediaRecorder.onstop = async () => {
        try {
          // Get the detected audio format
          const detectedType = chunksRef.current[0]?.type || 'audio/webm';
          const audioBlob = new Blob(chunksRef.current, { type: detectedType });
          
          console.log(`Audio blob created: ${audioBlob.size} bytes, type: ${detectedType}`);
          
          // Check blob size (minimum 500 bytes for any meaningful audio)
          if (audioBlob.size < 500) {
            console.log(`Audio blob too small: ${audioBlob.size} bytes`);
            setError('Recording too short, please speak longer');
            cleanupResources();
            resolve(null);
            return;
          }
          
          // Enhanced base64 conversion with error handling
          try {
            const base64 = await convertBlobToBase64(audioBlob);
            console.log(`Audio converted to base64: ${base64.length} characters`);
            
            cleanupResources();
            resolve(base64);
          } catch (conversionError) {
            console.error('Base64 conversion failed:', conversionError);
            setError('Failed to process audio recording');
            cleanupResources();
            resolve(null);
          }
          
        } catch (err) {
          console.error('Error processing recording:', err);
          setError('Failed to process recording');
          cleanupResources();
          resolve(null);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder stop error:', event);
        setError('Recording failed');
        cleanupResources();
        resolve(null);
      };

      // Clean up function
      const cleanupResources = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        chunksRef.current = [];
      };

      try {
        mediaRecorder.stop();
      } catch (stopError) {
        console.error('Error stopping media recorder:', stopError);
        cleanupResources();
        resolve(null);
      }
    });
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error
  };
};