"use client";
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Users,
  Star,
  TrendingUp,
  Film,
  Wallet,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

const Hero = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !vantaRef.current) return;

    const loadVanta = async () => {
      try {
        // Load scripts dynamically
        const loadScript = (src: string): Promise<void> => {
          return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        };

        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.rings.min.js"
        );

        // Clean up previous effect
        if (vantaEffect) vantaEffect.destroy();

        const isDark = resolvedTheme === "dark";

        const effect = (window as any).VANTA.RINGS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 0.7,
          backgroundColor: isDark ? 0x0a0a0f : 0xfafafa,
          color: isDark ? 0x8b5cf6 : 0x6366f1,
          color2: isDark ? 0x06b6d4 : 0x8b5cf6,
          size: 1.2,
          speed: 0.6,
        });

        setVantaEffect(effect);
      } catch (error) {
        console.error("Failed to load Vanta:", error);
      }
    };

    const timeoutId = setTimeout(loadVanta, 100);

    return () => {
      clearTimeout(timeoutId);
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [mounted, resolvedTheme]);

  const stats = [
    { icon: Users, label: "Active Users", value: "10K+" },
    { icon: Film, label: "Videos Streamed", value: "50K+" },
    { icon: Wallet, label: "Total Rewards", value: "$2M+" },
    { icon: Globe, label: "Countries", value: "100+" },
  ];

  const features = [
    { icon: Shield, text: "Secure Blockchain Storage" },
    { icon: Zap, text: "Lightning-Fast Streaming" },
    { icon: Star, text: "Creator Monetization" },
    { icon: TrendingUp, text: "NFT Integration" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Vanta.js Background */}
      <div ref={vantaRef} className="absolute inset-0 z-0" />

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-background/20 dark:bg-background/40 z-10" />

      {/* Main Hero Content */}
      <div className="container mx-auto relative z-30 flex-1 flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full py-20">
          {/* Left Content Column */}
          <div className="space-y-10 px-4 sm:px-0">
            {/* Main Heading */}
            <div className="space-y-7">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  StreamVerse
                </span>
                <span className="block bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent text-4xl md:text-5xl lg:text-4xl">
                  The Future of Digital Entertainment
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                Revolutionary decentralized streaming platform where creators
                monetize content through blockchain technology and viewers earn
                rewards for engagement.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 text-sm"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white text-lg px-8 py-4 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center">
                  Start Streaming Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/10 text-lg px-8 py-4 transition-all duration-300 backdrop-blur-sm bg-background/50"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-30 bg-background/30 backdrop-blur-sm border-t border-primary/10">
        <div className="container mx-auto py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center mb-3">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-40" />
    </section>
  );
};

export default Hero;
