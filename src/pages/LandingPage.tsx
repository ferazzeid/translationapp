import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, MessageCircle, Brain, Users, Heart } from "lucide-react";
const googlePlayButton = "/lovable-uploads/ea99cf28-e571-4519-b377-a7d30fea7b14.png";
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
              One Device
              <span className="block text-primary">Two People</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              AI-powered real-time translation designed for one-on-one conversations. Reliable, accurate, and simple enough for anyone to use together.
            </p>
            
            {/* Google Play Button */}
            <div className="flex justify-center mb-12">
              <button 
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.talkduo.app', '_blank')}
                className="transition-transform hover:scale-105"
              >
                <img 
                  src={googlePlayButton} 
                  alt="Get it on Google Play" 
                  className="h-16 md:h-20"
                />
              </button>
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
              Why Choose TalkDuo?
            </h2>
            <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
              Designed for real conversations between two people using one device. Simple, reliable, and AI-powered.
            </p>
            
            {/* Use Cases Section */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12 mb-16">
              {/* Personal Use Case */}
              <div className="p-8 rounded-2xl theme-surface border theme-border hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold theme-text-primary">For Personal Life</h3>
                </div>
                <p className="text-lg theme-text-secondary leading-relaxed">
                  TalkDuo is built for those moments when you simply can't avoid speaking with someone who doesn't share your language. You can't always rely on friends, translators, or expat circles—and sometimes you just have to figure it out yourself. With TalkDuo, each person speaks into the app in their own language and hears the other in theirs. Take it step by step, let the app guide the exchange, and you'll get through any conversation barrier.
                </p>
              </div>

              {/* Business Use Case */}
              <div className="p-8 rounded-2xl theme-surface border theme-border hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold theme-text-primary">For Business</h3>
                </div>
                <p className="text-lg theme-text-secondary leading-relaxed">
                  TalkDuo for Business bridges the gap when staff and guests don't share a common language. In hotels, shops, cafés, or restaurants, not every employee speaks English—or any foreign language—but international visitors still expect to be understood. With TalkDuo, your team can instantly hand the device to a guest, let them speak in their own language, and keep the conversation flowing smoothly. It's a simple way to reduce stress for employees, serve customers better, and maintain high satisfaction in any multilingual setting.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 rounded-2xl theme-surface border theme-border">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 theme-text-primary">Any Language</h3>
              <p className="theme-text-secondary leading-relaxed">
                Real-time translation across 100+ languages with AI-powered accuracy. No language barriers.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl theme-surface border theme-border">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 theme-text-primary">One-on-One Conversations</h3>
              <p className="theme-text-secondary leading-relaxed">
                Two people, one device. Share the screen and have natural conversations with instant translation.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl theme-surface border theme-border">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 theme-text-primary">Managed Mode</h3>
              <p className="theme-text-secondary leading-relaxed">
                Perfect for non-tech-savvy users. The app guides the conversation flow, making it reliable and easy to use together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Talk?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Experience reliable, AI-powered conversations that work for everyone.
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={() => window.open('https://play.google.com/store/apps/details?id=com.talkduo.app', '_blank')}
              className="transition-transform hover:scale-105"
            >
              <img 
                src={googlePlayButton} 
                alt="Get it on Google Play" 
                className="h-16 md:h-20"
              />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 theme-surface border-t theme-border">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4 theme-text-primary">TalkDuo</h3>
          <p className="theme-text-secondary mb-6">
            One device, two people, any language.
          </p>
          <div className="flex justify-center space-x-8">
            <a href="/privacy" className="theme-text-secondary hover:theme-text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="theme-text-secondary hover:theme-text-primary transition-colors">
              Terms & Conditions
            </a>
            <a href="/app" className="theme-text-secondary hover:theme-text-primary transition-colors">
              Web App
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;