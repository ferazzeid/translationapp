import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface AdminAuthProps {
  onAdminAuthenticated: (user: User) => void;
  onBackToApp: () => void;
}

export const AdminAuth = ({ onAdminAuthenticated, onBackToApp }: AdminAuthProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        onAdminAuthenticated(session.user);
      }
    };
    
    checkAuth();
  }, [onAdminAuthenticated]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-strong border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Admin Access
            </CardTitle>
            <CardDescription>
              Sign in with your Google account to access admin settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoogleAuth}
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in with Google"}
            </Button>
            
            <div className="mt-6 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onBackToApp}
              >
                Back to App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};