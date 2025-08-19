import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy – TalkDuo</CardTitle>
            <p className="text-center text-muted-foreground">
              <strong>Effective Date:</strong> August 19, 2025
            </p>
            <p className="text-center text-muted-foreground">
              <strong>Company:</strong> Socially Famous Applications
            </p>
            <p className="text-center text-muted-foreground">
              <strong>Contact:</strong> sociallyfamous@gmail.com
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="mb-4">When you use TalkDuo, we may collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Basic profile information from Google when you log in (name, email address, and profile picture).</li>
                <li>App usage information such as session data and analytics (via Google Analytics).</li>
                <li>Account information you provide to manage your profile or subscription.</li>
              </ul>
              <p className="mt-4">We do not collect sensitive information such as financial data, health records, or contact lists.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. How We Use Information</h2>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authenticate your account and allow you to log in.</li>
                <li>Provide and improve app functionality.</li>
                <li>Enable paid services and maintain your subscription (if applicable).</li>
                <li>Monitor app performance and usage trends through analytics.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Data Sharing</h2>
              <p className="mb-4">We do not sell or rent your personal data.</p>
              <p className="mb-4">We only share information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Supabase (for database, authentication, and hosting).</li>
                <li>Google Analytics (for usage statistics).</li>
                <li>Service providers necessary to operate TalkDuo.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Data Retention & Security</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We retain your data for as long as your account is active or as needed to provide the service.</li>
                <li>We use industry-standard security practices to protect your information.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
              <p>
                Depending on your location (e.g., GDPR, CCPA), you may have rights to access, correct, or delete your personal data. 
                You can contact us at <a href="mailto:sociallyfamous@gmail.com" className="text-primary hover:underline">sociallyfamous@gmail.com</a> to exercise these rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Changes</h2>
              <p>We may update this policy from time to time. Updates will be posted here with a new effective date.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;