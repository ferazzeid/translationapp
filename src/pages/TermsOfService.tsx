import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
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
            <CardTitle className="text-3xl font-bold text-center">Terms of Service – TalkDuo</CardTitle>
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
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By using TalkDuo, you agree to these Terms of Service and our Privacy Policy. 
                If you do not agree, please do not use the app.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Use of Service</h2>
              <p>
                TalkDuo is provided for personal and lawful use only. You agree not to misuse the app, 
                attempt unauthorized access, or interfere with its operation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Accounts & Payments</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account. If paid features are offered, 
                you agree to provide accurate payment information and comply with applicable subscription terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Intellectual Property</h2>
              <p>
                All content and technology provided through TalkDuo are owned by Socially Famous Applications. 
                You may not copy, distribute, or reverse engineer the app without permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Disclaimer of Warranty</h2>
              <p>
                TalkDuo is provided "as is" without warranties of any kind. We do not guarantee uninterrupted 
                or error-free service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Socially Famous Applications is not liable for damages 
                arising from use of the app, including loss of data, service interruptions, or third-party actions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Termination</h2>
              <p>
                We may suspend or terminate your account if you violate these Terms or misuse the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Governing Law</h2>
              <p>
                These Terms are governed by the laws of Switzerland.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;