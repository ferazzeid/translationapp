import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

interface AuthPageProps {
  onAuthenticated: (user: User, session: Session) => void;
}

export const AuthPage = ({ onAuthenticated }: AuthPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          onAuthenticated(session.user, session);
        }
        setInitializing(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        onAuthenticated(session.user, session);
      }
      setInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, [onAuthenticated]);

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
        title: "Google Sign In Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Welcome back!",
        });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          toast({
            title: "Check your email",
            description: "We sent you a confirmation link to complete your registration.",
          });
        } else {
          toast({
            title: "Welcome!",
            description: "Your account has been created successfully.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;

      toast({
        title: "Reset Email Sent",
        description: "Check your email for a password reset link.",
      });
      
      setShowResetForm(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Reset Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-dvh bg-gradient-surface flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-strong border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              {showResetForm ? "Reset Password" : "Welcome to TalkDuo"}
            </CardTitle>
            <CardDescription>
              {showResetForm 
                ? "Enter your email to receive a reset link" 
                : isLogin ? "Sign in to continue" : "Create your account"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showResetForm ? (
              // Password Reset Form
              <>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Send Reset Link
                  </Button>
                </form>
                
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                      setShowResetForm(false);
                      setResetEmail("");
                    }}
                    disabled={resetLoading}
                  >
                    Back to Sign In
                  </button>
                </div>
              </>
            ) : (
              // Regular Login/Signup Form
              <>
                <Button 
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  minLength={6}
                />
              </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>
              
              {/* Forgot Password Link - Only show on login */}
              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 transition-colors underline"
                    onClick={() => setShowResetForm(true)}
                    disabled={loading}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
              
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsLogin(!isLogin)}
                  disabled={loading}
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};