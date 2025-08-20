// Performance Analytics for Translation Pipeline
// Tracks timing for each stage to identify bottlenecks

interface PipelineStage {
  stage: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface PipelineMetrics {
  sessionId: string;
  speaker: "A" | "B";
  stages: PipelineStage[];
  totalDuration: number;
  audioSize: number;
  originalLanguage: string;
  targetLanguage: string;
}

class PerformanceAnalytics {
  private currentSession: string | null = null;
  private activePipelines: Map<string, PipelineStage[]> = new Map();

  generateSessionId(): string {
    this.currentSession = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return this.currentSession;
  }

  startPipeline(speaker: "A" | "B", audioSize: number): string {
    const pipelineId = `${speaker}-${Date.now()}`;
    const startStage: PipelineStage = {
      stage: 'pipeline-start',
      startTime: performance.now()
    };
    
    this.activePipelines.set(pipelineId, [startStage]);
    
    console.log(`🚀 Pipeline started for Speaker ${speaker}`, {
      pipelineId,
      audioSize: `${(audioSize / 1024).toFixed(1)}KB`,
      timestamp: new Date().toISOString()
    });
    
    return pipelineId;
  }

  startStage(pipelineId: string, stageName: string): void {
    const stages = this.activePipelines.get(pipelineId);
    if (!stages) return;

    // End previous stage if exists
    const lastStage = stages[stages.length - 1];
    if (lastStage && !lastStage.endTime) {
      lastStage.endTime = performance.now();
      lastStage.duration = lastStage.endTime - lastStage.startTime;
    }

    // Start new stage
    const newStage: PipelineStage = {
      stage: stageName,
      startTime: performance.now()
    };
    
    stages.push(newStage);
    
    console.log(`⏱️  Stage started: ${stageName}`, {
      pipelineId,
      previousStageDuration: lastStage?.duration ? `${lastStage.duration.toFixed(0)}ms` : 'N/A'
    });
  }

  endPipeline(pipelineId: string, originalLanguage: string, targetLanguage: string, success: boolean = true): void {
    const stages = this.activePipelines.get(pipelineId);
    if (!stages) return;

    // End final stage
    const lastStage = stages[stages.length - 1];
    if (lastStage && !lastStage.endTime) {
      lastStage.endTime = performance.now();
      lastStage.duration = lastStage.endTime - lastStage.startTime;
    }

    // Calculate total duration
    const totalDuration = performance.now() - stages[0].startTime;
    
    // Log detailed metrics
    const metrics = {
      pipelineId,
      totalDuration: `${totalDuration.toFixed(0)}ms`,
      success,
      stages: stages.map(stage => ({
        stage: stage.stage,
        duration: stage.duration ? `${stage.duration.toFixed(0)}ms` : 'incomplete'
      })),
      languages: `${originalLanguage} → ${targetLanguage}`,
      timestamp: new Date().toISOString()
    };

    console.group(`🏁 Pipeline completed: ${success ? '✅' : '❌'}`);
    console.log('Total Duration:', metrics.totalDuration);
    console.log('Stage Breakdown:', metrics.stages);
    console.log('Languages:', metrics.languages);
    console.groupEnd();

    // Identify bottlenecks
    const sortedStages = stages
      .filter(s => s.duration)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));
    
    if (sortedStages.length > 0) {
      const slowestStage = sortedStages[0];
      if ((slowestStage.duration || 0) > 1000) {
        console.warn(`🐌 Slow stage detected: ${slowestStage.stage} took ${slowestStage.duration?.toFixed(0)}ms`);
      }
    }

    // Clean up
    this.activePipelines.delete(pipelineId);
  }

  logError(pipelineId: string, stage: string, error: any): void {
    console.error(`❌ Pipeline error in ${stage}:`, {
      pipelineId,
      stage,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    });
    
    this.endPipeline(pipelineId, 'unknown', 'unknown', false);
  }

  getLatencyTarget(): { target: number; warning: number } {
    return {
      target: 1500, // 1.5s target
      warning: 2500  // 2.5s warning threshold
    };
  }

  // Simplified timing interface for pipeline optimizer
  startTiming(speaker: "A" | "B", originalLang: string, targetLang: string) {
    return {
      speaker,
      originalLang,
      targetLang,
      stages: {} as Record<string, number>,
      startTime: performance.now(),
      recordStage: function(stage: string) {
        this.stages[stage] = performance.now() - this.startTime;
      }
    };
  }

  logTiming(timing: any) {
    const total = timing.stages.total || (performance.now() - timing.startTime);
    console.log(`[Performance] ${timing.speaker}: ${timing.originalLang} → ${timing.targetLang}`, {
      stages: timing.stages,
      total: `${total.toFixed(0)}ms`
    });
  }
}

export const performanceAnalytics = new PerformanceAnalytics();