import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Clock, Zap } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useGooglePlayBilling } from "@/hooks/useGooglePlayBilling";

export const SubscriptionStatus = () => {
  const { subscription, loading, trialLimits } = useSubscription();
  const { purchaseProduct, loading: billingLoading } = useGooglePlayBilling();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading subscription status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const handleUpgrade = async () => {
    try {
      await purchaseProduct('premium_monthly');
      // After successful purchase, the subscription status will be updated
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const getStatusColor = () => {
    switch (subscription.status) {
      case 'premium': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'trial': return subscription.canUseFeatures ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gradient-to-r from-gray-400 to-gray-600';
      case 'expired': return 'bg-gradient-to-r from-red-400 to-red-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const getStatusText = () => {
    if (subscription.status === 'premium') return 'Premium Active';
    if (subscription.status === 'trial' && subscription.canUseFeatures) return 'Free Trial Active';
    if (subscription.trialExpired) return 'Trial Expired';
    if (subscription.trialCallsExceeded) return 'Trial Limit Reached';
    return 'Trial Expired';
  };

  const getTimeRemaining = () => {
    if (!subscription.trialStartedAt || subscription.status !== 'trial') return null;
    
    const trialStart = new Date(subscription.trialStartedAt);
    const trialEnd = new Date(trialStart.getTime() + trialLimits.hours * 60 * 60 * 1000);
    const now = new Date();
    const remaining = Math.max(0, trialEnd.getTime() - now.getTime());
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };

  const timeRemaining = getTimeRemaining();
  const callsProgress = (subscription.trialApiCallsUsed / trialLimits.calls) * 100;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {subscription.status === 'premium' ? (
              <Crown className="h-5 w-5 text-yellow-500" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
            Subscription Status
          </CardTitle>
          <Badge 
            className={`theme-mic-fg ${getStatusColor()}`}
          >
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {subscription.status === 'trial' && (
          <div className="space-y-3">
            {timeRemaining && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Remaining</span>
                <span className="font-medium">
                  {timeRemaining.hours}h {timeRemaining.minutes}m
                </span>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Calls Used</span>
                <span className="font-medium">
                  {subscription.trialApiCallsUsed} / {trialLimits.calls}
                </span>
              </div>
              <Progress value={callsProgress} className="h-2" />
            </div>
          </div>
        )}

        {subscription.status === 'premium' && subscription.subscriptionExpiresAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expires</span>
            <span className="font-medium">
              {new Date(subscription.subscriptionExpiresAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {!subscription.canUseFeatures && (
          <div className="space-y-3 pt-2 border-t">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {subscription.trialExpired 
                  ? "Your 24-hour trial has expired" 
                  : "You've reached your trial limit"}
              </p>
              <p className="text-sm font-medium">
                Upgrade to Premium for unlimited access
              </p>
            </div>
            
            <Button 
              onClick={handleUpgrade}
              disabled={billingLoading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 theme-mic-fg"
            >
              <Crown className="mr-2 h-4 w-4" />
              {billingLoading ? "Processing..." : "Upgrade to Premium"}
            </Button>
          </div>
        )}

        {subscription.status === 'trial' && subscription.canUseFeatures && (
          <div className="pt-2 border-t">
            <Button 
              onClick={handleUpgrade}
              disabled={billingLoading}
              variant="outline"
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Early & Save
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};