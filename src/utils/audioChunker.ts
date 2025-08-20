interface AudioChunk {
  blob: Blob;
  index: number;
  isLast: boolean;
}

export class AudioChunker {
  private static MAX_CHUNK_DURATION = 4000; // 4 seconds in ms
  private static OVERLAP_DURATION = 200; // 200ms overlap to prevent word cutting

  static async chunkAudio(audioBlob: Blob): Promise<AudioChunk[]> {
    // For now, we'll use a simple size-based chunking approach
    // In the future, this could be enhanced with VAD-based intelligent splitting
    
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const duration = audioBuffer.duration * 1000; // Convert to ms
      
      // If audio is shorter than max chunk duration, return as single chunk
      if (duration <= this.MAX_CHUNK_DURATION) {
        return [{
          blob: audioBlob,
          index: 0,
          isLast: true
        }];
      }

      const chunks: AudioChunk[] = [];
      const sampleRate = audioBuffer.sampleRate;
      const numberOfChannels = audioBuffer.numberOfChannels;
      
      const samplesPerChunk = Math.floor((this.MAX_CHUNK_DURATION / 1000) * sampleRate);
      const overlapSamples = Math.floor((this.OVERLAP_DURATION / 1000) * sampleRate);
      
      let startSample = 0;
      let chunkIndex = 0;
      
      while (startSample < audioBuffer.length) {
        const endSample = Math.min(startSample + samplesPerChunk, audioBuffer.length);
        const isLast = endSample >= audioBuffer.length;
        
        // Create new audio buffer for this chunk
        const chunkLength = endSample - startSample;
        const chunkBuffer = audioContext.createBuffer(numberOfChannels, chunkLength, sampleRate);
        
        // Copy audio data
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sourceData = audioBuffer.getChannelData(channel);
          const chunkData = chunkBuffer.getChannelData(channel);
          
          for (let i = 0; i < chunkLength; i++) {
            chunkData[i] = sourceData[startSample + i];
          }
        }
        
        // Convert back to blob
        const chunkBlob = await this.audioBufferToBlob(chunkBuffer, audioBlob.type);
        
        chunks.push({
          blob: chunkBlob,
          index: chunkIndex,
          isLast
        });
        
        // Move to next chunk with overlap (except for last chunk)
        if (!isLast) {
          startSample += samplesPerChunk - overlapSamples;
        } else {
          break;
        }
        
        chunkIndex++;
      }
      
      return chunks;
      
    } finally {
      audioContext.close();
    }
  }

  private static async audioBufferToBlob(audioBuffer: AudioBuffer, mimeType: string): Promise<Blob> {
    // Simple PCM to WAV conversion for compatibility
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numberOfChannels * 2; // 16-bit samples
    
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: mimeType });
  }
}