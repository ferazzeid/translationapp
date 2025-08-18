import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface AdminAuthProps {
  onAdminAuthenticated: (user: User) => void;
  onBackToApp: () => void;
}

export const AdminAuth = ({ onAdminAuthenticated, onBackToApp }: AdminAuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", session.user.id)
          .single();
        
        if (profile?.display_name?.toLowerCase().includes("admin")) {
          onAdminAuthenticated(session.user);
        }
      }
    };
    
    checkAuth();
  }, [onAdminAuthenticated]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Development bypass for admin@admin
      if (email === "admin@admin" && password === "admin") {
        // Create a real admin user for development
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: "devadmin@example.com",
          password: "devadminpass123",
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: "admin"
            }
          }
        });

        if (signUpError && !signUpError.message.includes("already registered")) {
          throw signUpError;
        }

        // Try to sign in with the dev admin account
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: "devadmin@example.com",
          password: "devadminpass123"
        });

        if (signInError) throw signInError;

        if (signInData.user) {
          // Ensure profile exists
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              user_id: signInData.user.id,
              display_name: "admin"
            }, {
              onConflict: "user_id"
            });

          if (profileError) console.log("Profile creation error:", profileError);

          onAdminAuthenticated(signInData.user);
          toast({
            title: "Success",
            description: "Development admin access granted!",
          });
          setLoading(false);
          return;
        }
      }

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check if user is admin
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", data.user.id)
            .single();
          
          if (profile?.display_name?.toLowerCase().includes("admin")) {
            onAdminAuthenticated(data.user);
            toast({
              title: "Success",
              description: "Welcome back, admin!",
            });
          } else {
            await supabase.auth.signOut();
            toast({
              title: "Access Denied",
              description: "Admin privileges required.",
              variant: "destructive",
            });
          }
        }
      } else {
        // Sign up with admin profile
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: "admin"
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Success",
            description: "Admin account created! Please check your email to verify.",
          });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
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
              {isLogin ? "Sign in to access admin settings" : "Create admin account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Use 'admin@admin' for dev access"
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
                  placeholder="Use 'admin' for dev access"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Admin Account")}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Need to create admin account?" : "Already have an account?"}
              </button>
            </div>
            
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