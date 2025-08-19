import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Smartphone, Globe, Users } from "lucide-react";
const landingHeroBg = "/lovable-uploads/7d33a979-ef4a-4ab9-84af-a3cdfa66b285.png";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Full Background */}
      <section 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${landingHeroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Break Language
              <span className="block text-primary">Barriers</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              Real-time translation that brings people together. Communicate seamlessly across languages with our powerful translation bridge.
            </p>
            
            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4 h-auto"
                onClick={() => window.open('https://play.google.com/store', '_blank')}
              >
                <Download className="mr-2" />
                Get on Google Play
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-4 h-auto"
                onClick={() => window.open('https://apps.apple.com', '_blank')}
              >
                <Smartphone className="mr-2" />
                Download for iOS
              </Button>
            </div>

            {/* Try Web Version */}
            <div className="mb-8">
              <Button 
                variant="secondary"
                size="lg"
                className="text-lg px-8 py-4 h-auto"
                onClick={() => window.location.href = '/app'}
              >
                Try Web Version
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 theme-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 theme-text-primary">
              Why Choose Translation Bridge?
            </h2>
            <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
              Experience the future of cross-language communication with our cutting-edge features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 rounded-2xl theme-surface border theme-border">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 theme-text-primary">Real-Time Translation</h3>
              <p className="theme-text-secondary leading-relaxed">
                Instant voice and text translation across 100+ languages with AI-powered accuracy.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl theme-surface border theme-border">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 theme-text-primary">Group Conversations</h3>
              <p className="theme-text-secondary leading-relaxed">
                Connect multiple people speaking different languages in seamless group conversations.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl theme-surface border theme-border">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 theme-text-primary">Cross-Platform</h3>
              <p className="theme-text-secondary leading-relaxed">
                Available on web, iOS, and Android. Start on one device, continue on another.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Connect?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join millions of users breaking down language barriers every day.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4 h-auto"
              onClick={() => window.location.href = '/app'}
            >
              Start Translating Now
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 theme-surface border-t theme-border">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4 theme-text-primary">Translation Bridge</h3>
          <p className="theme-text-secondary mb-6">
            Breaking language barriers, building connections.
          </p>
          <div className="flex justify-center space-x-8">
            <a href="/app" className="theme-text-secondary hover:theme-text-primary transition-colors">
              Web App
            </a>
            <a href="mailto:support@translationbridge.com" className="theme-text-secondary hover:theme-text-primary transition-colors">
              Support
            </a>
            <a href="/privacy" className="theme-text-secondary hover:theme-text-primary transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;