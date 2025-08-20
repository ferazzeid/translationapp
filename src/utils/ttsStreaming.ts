interface StreamingTTSOptions {
  text: string;
  voice: string;
  onFirstChunk?: () => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

interface AudioChunkData {
  audioContent: string;
  isLast: boolean;
  chunkIndex: number;
}

export class TTSStreaming {
  private audioQueue: HTMLAudioElement[] = [];
  private isPlaying = false;
  private currentIndex = 0;

  async synthesizeAndStream(options: StreamingTTSOptions): Promise<void> {
    const { text, voice, onFirstChunk, onProgress, onError } = options;
    
    try {
      // Reset state
      this.audioQueue = [];
      this.isPlaying = false;
      this.currentIndex = 0;

      // For now, we'll simulate streaming by chunking the text
      // In a real implementation, this would use a streaming TTS API
      const textChunks = this.chunkText(text);
      
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        const isLast = i === textChunks.length - 1;
        
        try {
          // Generate audio for this chunk
          const audioContent = await this.generateChunkAudio(chunk, voice);
          
          // Create audio element
          const audio = new Audio();
          audio.src = `data:audio/mp3;base64,${audioContent}`;
          
          // Add to queue
          this.audioQueue.push(audio);
          
          // Start playing if this is the first chunk
          if (i === 0 && onFirstChunk) {
            onFirstChunk();
            this.startPlayback();
          }
          
          // Report progress
          if (onProgress) {
            onProgress((i + 1) / textChunks.length);
          }
          
        } catch (error) {
          console.error(`Error generating chunk ${i}:`, error);
          if (onError) {
            onError(error instanceof Error ? error : new Error('TTS chunk generation failed'));
          }
        }
      }
      
    } catch (error) {
      console.error('TTS streaming error:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('TTS streaming failed'));
      }
    }
  }

  private chunkText(text: string): string[] {
    // Simple sentence-based chunking
    // This could be enhanced with more sophisticated NLP
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      
      // If adding this sentence would make chunk too long, start new chunk
      if (currentChunk && (currentChunk + ' ' + trimmed).length > 100) {
        chunks.push(currentChunk);
        currentChunk = trimmed;
      } else {
        currentChunk = currentChunk ? currentChunk + '. ' + trimmed : trimmed;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks.length > 0 ? chunks : [text];
  }

  private async generateChunkAudio(text: string, voice: string): Promise<string> {
    // Use existing TTS function
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: {
        text,
        voice: voice
      }
    });

    if (error) throw error;
    return data.audioContent;
  }

  private async startPlayback() {
    if (this.isPlaying || this.audioQueue.length === 0) return;
    
    this.isPlaying = true;
    this.currentIndex = 0;
    
    await this.playNext();
  }

  private async playNext() {
    if (this.currentIndex >= this.audioQueue.length) {
      this.isPlaying = false;
      return;
    }
    
    const audio = this.audioQueue[this.currentIndex];
    
    return new Promise<void>((resolve) => {
      audio.onended = () => {
        this.currentIndex++;
        resolve();
        // Immediately play next chunk
        this.playNext();
      };
      
      audio.onerror = () => {
        console.error('Audio playback error for chunk', this.currentIndex);
        this.currentIndex++;
        resolve();
        this.playNext();
      };
      
      audio.play().catch(error => {
        console.error('Audio play error:', error);
        this.currentIndex++;
        resolve();
        this.playNext();
      });
    });
  }

  stop() {
    this.isPlaying = false;
    this.audioQueue.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.audioQueue = [];
    this.currentIndex = 0;
  }
}