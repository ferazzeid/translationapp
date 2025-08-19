import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionStatus {
  status: 'trial' | 'premium' | 'expired';
  trialStartedAt?: string;
  trialApiCallsUsed: number;
  subscriptionExpiresAt?: string;
  trialExpired: boolean;
  trialCallsExceeded: boolean;
  canUseFeatures: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [trialLimits, setTrialLimits] = useState({ calls: 100, hours: 24 });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSubscriptionStatus();
      loadTrialLimits();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const loadTrialLimits = async () => {
    try {
      const { data: callLimit } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'trial_api_call_limit')
        .single();

      const { data: hourLimit } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'trial_duration_hours')
        .single();

      setTrialLimits({
        calls: callLimit ? parseInt(callLimit.setting_value) : 100,
        hours: hourLimit ? parseInt(hourLimit.setting_value) : 24
      });
    } catch (error) {
      console.error('Failed to load trial limits:', error);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status, trial_started_at, trial_api_calls_used, subscription_expires_at')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;

      if (profile) {
        const now = new Date();
        const trialStart = profile.trial_started_at ? new Date(profile.trial_started_at) : null;
        const trialExpired = trialStart ? 
          (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60) > trialLimits.hours : false;
        
        const trialCallsExceeded = (profile.trial_api_calls_used || 0) >= trialLimits.calls;
        
        const canUseFeatures = profile.subscription_status === 'premium' || 
          (profile.subscription_status === 'trial' && !trialExpired && !trialCallsExceeded);

        setSubscription({
          status: profile.subscription_status as any,
          trialStartedAt: profile.trial_started_at,
          trialApiCallsUsed: profile.trial_api_calls_used || 0,
          subscriptionExpiresAt: profile.subscription_expires_at,
          trialExpired,
          trialCallsExceeded,
          canUseFeatures
        });
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementApiCall = async () => {
    if (!user || !subscription) return;

    try {
      const newCount = subscription.trialApiCallsUsed + 1;
      
      const { error } = await supabase
        .from('profiles')
        .update({ trial_api_calls_used: newCount })
        .eq('user_id', user.id);

      if (error) throw error;

      setSubscription(prev => prev ? {
        ...prev,
        trialApiCallsUsed: newCount,
        trialCallsExceeded: newCount >= trialLimits.calls,
        canUseFeatures: prev.status === 'premium' || 
          (prev.status === 'trial' && !prev.trialExpired && newCount < trialLimits.calls)
      } : null);

      // Show warning when approaching limit
      if (subscription.status === 'trial' && newCount >= trialLimits.calls * 0.8) {
        toast({
          title: "Trial Limit Warning",
          description: `You've used ${newCount} of ${trialLimits.calls} trial API calls`,
        });
      }
    } catch (error) {
      console.error('Failed to increment API call count:', error);
    }
  };

  const upgradeToPremium = async (purchaseToken?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'premium',
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await loadSubscriptionStatus();
      
      toast({
        title: "Welcome to Premium!",
        description: "You now have unlimited access to all features",
      });
    } catch (error) {
      console.error('Failed to upgrade to premium:', error);
      toast({
        title: "Upgrade Failed",
        description: "Failed to activate premium subscription",
        variant: "destructive"
      });
    }
  };

  return {
    subscription,
    loading,
    trialLimits,
    loadSubscriptionStatus,
    incrementApiCall,
    upgradeToPremium
  };
};