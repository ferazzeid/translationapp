import { AbstractSTTProvider, STTConfig, STTProvider } from '@/types/stt';
import { OpenAISTTService } from './OpenAISTTService';
import { GoogleStreamingSTTService } from './GoogleStreamingSTTService';
import { supabase } from '@/integrations/supabase/client';

export class STTServiceFactory {
  private static instance: STTServiceFactory;
  private currentProvider: AbstractSTTProvider | null = null;
  private config: STTConfig | null = null;

  private constructor() {}

  static getInstance(): STTServiceFactory {
    if (!STTServiceFactory.instance) {
      STTServiceFactory.instance = new STTServiceFactory();
    }
    return STTServiceFactory.instance;
  }

  async loadConfiguration(): Promise<STTConfig> {
    try {
      console.log('[STT Factory] Loading configuration from admin settings...');

      // Load STT provider configuration from admin settings
      const { data: providerSetting } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'stt_provider')
        .single();

      const { data: timeoutSetting } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'stt_timeout')
        .single();

      const { data: telemetrySetting } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'stt_telemetry_enabled')
        .single();

      const { data: fallbackSetting } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'stt_fallback_provider')
        .single();

      const config: STTConfig = {
        provider: (providerSetting?.setting_value as STTProvider) || 'openai',
        fallbackProvider: (fallbackSetting?.setting_value as STTProvider) || 'openai',
        timeout: parseInt(timeoutSetting?.setting_value || '60000'), // 60s default
        enableTelemetry: telemetrySetting?.setting_value === 'true'
      };

      console.log('[STT Factory] Configuration loaded:', config);
      
      this.config = config;
      return config;

    } catch (error) {
      console.error('[STT Factory] Failed to load configuration, using defaults:', error);
      
      // Default configuration
      const defaultConfig: STTConfig = {
        provider: 'openai',
        fallbackProvider: 'openai',
        timeout: 60000,
        enableTelemetry: false
      };

      this.config = defaultConfig;
      return defaultConfig;
    }
  }

  async getSTTProvider(forceReload = false): Promise<AbstractSTTProvider> {
    // Load config if not loaded or forced reload
    if (!this.config || forceReload) {
      await this.loadConfiguration();
    }

    // Return cached provider if same configuration
    if (this.currentProvider && this.currentProvider.getProviderName() === this.config!.provider) {
      return this.currentProvider;
    }

    // Create new provider instance
    console.log('[STT Factory] Creating STT provider:', this.config!.provider);
    
    this.currentProvider = this.createProvider(this.config!);
    return this.currentProvider;
  }

  private createProvider(config: STTConfig): AbstractSTTProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAISTTService(config);
      
      case 'google_streaming':
        return new GoogleStreamingSTTService(config);
      
      default:
        console.warn('[STT Factory] Unknown provider, falling back to OpenAI:', config.provider);
        return new OpenAISTTService({ ...config, provider: 'openai' });
    }
  }

  async getProviderWithFallback(): Promise<AbstractSTTProvider> {
    try {
      const primaryProvider = await this.getSTTProvider();
      return primaryProvider;
    } catch (error) {
      console.error('[STT Factory] Primary provider failed, trying fallback:', error);
      
      if (this.config?.fallbackProvider && this.config.fallbackProvider !== this.config.provider) {
        const fallbackConfig = { ...this.config, provider: this.config.fallbackProvider };
        return this.createProvider(fallbackConfig);
      }
      
      // Last resort: always return OpenAI as ultimate fallback
      return new OpenAISTTService({
        provider: 'openai',
        timeout: 60000,
        enableTelemetry: false
      });
    }
  }

  // Developer utilities
  async switchProvider(provider: STTProvider): Promise<void> {
    console.log('[STT Factory] Switching to provider:', provider);
    
    if (this.config) {
      this.config.provider = provider;
      this.currentProvider = null; // Force recreation
    }
  }

  getCurrentProviderName(): STTProvider | null {
    return this.currentProvider?.getProviderName() || null;
  }

  isStreamingAvailable(): boolean {
    return this.currentProvider?.isStreamingSupported() || false;
  }
}

// Export singleton instance
export const sttServiceFactory = STTServiceFactory.getInstance();