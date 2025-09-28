"use client";
import React, { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Heart,
  Eye,
  Clock,
  TrendingUp,
  ArrowRight,
  Users,
  Film,
  Zap,
  Flame,
  Star,
  Crown,
} from "lucide-react";

// Card Component
interface NFTCardProps {
  title: string;
  image: string;
  price: string;
  creator: string;
  duration?: string;
  views?: number;
  likes?: number;
  rarity?: "Common" | "Rare" | "Epic" | "Legendary";
  className?: string;
  style?: React.CSSProperties;
}

const NFTCard: React.FC<NFTCardProps> = ({
  title,
  image,
  price,
  creator,
  duration,
  views,
  likes,
  rarity = "Common",
  className = "",
  style,
}) => {
  const rarityColors = {
    Common: "bg-muted text-muted-foreground",
    Rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return (
    <div className={`nft-card group ${className}`} style={style}>
      <div className="relative overflow-hidden rounded-xl mb-4">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover transition-all duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button size="lg" className="btn-glow rounded-full h-14 w-14 p-0">
            <Play className="h-6 w-6 fill-current" />
          </Button>
        </div>

        {/* Rarity Badge */}
        <Badge
          className={`absolute top-3 left-3 ${rarityColors[rarity]} border`}
        >
          {rarity}
        </Badge>

        {/* Stats */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {views && (
            <div className="glassmorphism px-2 py-1 text-xs flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {views.toLocaleString()}
            </div>
          )}
          {likes && (
            <div className="glassmorphism px-2 py-1 text-xs flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {likes}
            </div>
          )}
        </div>

        {/* Duration */}
        {duration && (
          <div className="absolute bottom-3 right-3 glassmorphism px-2 py-1 text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-glow group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">by {creator}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-primary font-bold text-lg">{price} ETH</div>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/10 border-primary/30"
          >
            Place Bid
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Marketplace Component
const Marketplace = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // NOTE: Using publicly-available Unsplash source queries for dummy movie images.
  // These return movie-themed images relevant to the query and are useful for placeholders.

  // Featured Collections Data
  const collections = [
    {
      name: "Sci-Fi Classics",
      description: "Legendary science fiction movies from the golden age",
      items: 156,
      floorPrice: "0.8",
      image:
        "https://imgs.search.brave.com/kpylS6RuTSXUuM7jIAPtdM1xM0iFabnecN2dx7jqsog/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMud2lraWEubm9j/b29raWUubmV0L2ph/bWVzY2FtZXJvbnNh/dmF0YXIvaW1hZ2Vz/L2QvZGEvQXZhdGFy/X0JhY2tfaW5fVGhl/YXRlcnNfcG9zdGVy/LnBuZy9yZXZpc2lv/bi9sYXRlc3Qvc2Nh/bGUtdG8td2lkdGgt/ZG93bi8yNTA_Y2I9/MjAyMjA4MjMxNzEw/NDY",
      badge: "Hot",
      icon: Flame,
      color: "text-orange-400",
    },
    {
      name: "Marvel Cinematic Universe",
      description: "Complete MCU collection with exclusive content",
      items: 89,
      floorPrice: "2.1",
      image:
        "https://imgs.search.brave.com/kpylS6RuTSXUuM7jIAPtdM1xM0iFabnecN2dx7jqsog/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMud2lraWEubm9j/b29raWUubmV0L2ph/bWVzY2FtZXJvbnNh/dmF0YXIvaW1hZ2Vz/L2QvZGEvQXZhdGFy/X0JhY2tfaW5fVGhl/YXRlcnNfcG9zdGVy/LnBuZy9yZXZpc2lv/bi9sYXRlc3Qvc2Nh/bGUtdG8td2lkdGgt/ZG93bi8yNTA_Y2I9/MjAyMjA4MjMxNzEw/NDY",
      badge: "Trending",
      icon: Star,
      color: "text-yellow-400",
    },
    {
      name: "Director's Vault",
      description: "Rare director's cuts and behind-the-scenes content",
      items: 67,
      floorPrice: "3.5",
      image:
        "https://imgs.search.brave.com/FnUAnrT3k3Cgs5Kn9hId2i_AYq-J8ESYFHvxRaRGFEQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bWFydmVsLmNvbS91/L3Byb2QvbWFydmVs/L2kvbWcvYS8yMC81/MTQ5ZWI0ODVmYmY4/L3BvcnRyYWl0X3Vu/Y2FubnkuanBn",
      badge: "Exclusive",
      icon: Crown,
      color: "text-purple-400",
    },
    {
      name: "Anime Masterpieces",
      description: "Studio Ghibli and top anime film collection",
      items: 124,
      floorPrice: "1.2",
      image:
        "https://imgs.search.brave.com/FnUAnrT3k3Cgs5Kn9hId2i_AYq-J8ESYFHvxRaRGFEQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bWFydmVsLmNvbS91/L3Byb2QvbWFydmVs/L2kvbWcvYS8yMC81/MTQ5ZWI0ODVmYmY4/L3BvcnRyYWl0X3Vu/Y2FubnkuanBn",
      badge: "New",
      icon: Zap,
      color: "text-blue-400",
    },
  ];

  // Trending NFTs Data
  const trendingNFTs = [
    {
      title: "Inception: Dream Sequence",
      image:
        "https://imgs.search.brave.com/_XKnrGyXiNqbvTz5ta7JetFp7hccxFrBZlSSAeZ1JnE/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvZW4vMi8yZS9J/bmNlcHRpb25fJTI4/MjAxMCUyOV90aGVh/dHJpY2FsX3Bvc3Rl/ci5qcGc",
      price: "4.2",
      creator: "Christopher Nolan",
      duration: "2h 28m",
      views: 23400,
      likes: 1892,
      rarity: "Legendary" as const,
    },
    {
      title: "Avatar: The Way of Water",
      image:
        "https://imgs.search.brave.com/FnUAnrT3k3Cgs5Kn9hId2i_AYq-J8ESYFHvxRaRGFEQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bWFydmVsLmNvbS91/L3Byb2QvbWFydmVs/L2kvbWcvYS8yMC81/MTQ5ZWI0ODVmYmY4/L3BvcnRyYWl0X3Vu/Y2FubnkuanBn",
      price: "3.8",
      creator: "James Cameron",
      duration: "3h 12m",
      views: 18750,
      likes: 1456,
      rarity: "Epic" as const,
    },
    {
      title: "Dune: Part Two",
      image:
        "https://imgs.search.brave.com/unwDz3XEapv0WhSxE4lfE7eIun2Y-vTWsnhVsGZVfwM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL00v/TVY1Qk5XSXlObVU1/TUdZdFpEWm1OaTAw/WmpBd0xXSmxZamd0/WlRjMFpHSXhNREU0/WkdZd1hrRXlYa0Zx/Y0djQC5qcGc",
      price: "2.9",
      creator: "Denis Villeneuve",
      duration: "2h 46m",
      views: 14320,
      likes: 983,
      rarity: "Rare" as const,
    },
    {
      title: "Spider-Verse: Multiverse",
      image:
        "https://imgs.search.brave.com/LOTBLb4HhiVyPtvkMpeJo9NBAhpGV767lT8JN0h0TXA/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvZW4vdGh1bWIv/MC8wOS9EZW1vbl9T/bGF5ZXJfLV9LaW1l/dHN1X25vX1lhaWJh/JTJDX3ZvbHVtZV8x/LmpwZy81MTJweC1E/ZW1vbl9TbGF5ZXJf/LV9LaW1ldHN1X25v/X1lhaWJhJTJDX3Zv/bHVtZV8xLmpwZw",
      price: "3.1",
      creator: "Sony Animation",
      duration: "2h 20m",
      views: 19800,
      likes: 1654,
      rarity: "Epic" as const,
    },
    {
      title: "Top Gun: Maverick",
      image:
        "https://imgs.search.brave.com/FnUAnrT3k3Cgs5Kn9hId2i_AYq-J8ESYFHvxRaRGFEQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bWFydmVsLmNvbS91/L3Byb2QvbWFydmVs/L2kvbWcvYS8yMC81/MTQ5ZWI0ODVmYmY4/L3BvcnRyYWl0X3Vu/Y2FubnkuanBn",
      price: "2.7",
      creator: "Paramount Pictures",
      duration: "2h 11m",
      views: 16540,
      likes: 1121,
      rarity: "Rare" as const,
    },
    {
      title: "The Batman Chronicles",
      image:
        "https://imgs.search.brave.com/FnUAnrT3k3Cgs5Kn9hId2i_AYq-J8ESYFHvxRaRGFEQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bWFydmVsLmNvbS91/L3Byb2QvbWFydmVs/L2kvbWcvYS8yMC81/MTQ5ZWI0ODVmYmY4/L3BvcnRyYWl0X3Vu/Y2FubnkuanBn",
      price: "3.5",
      creator: "Matt Reeves",
      duration: "2h 56m",
      views: 21650,
      likes: 1789,
      rarity: "Epic" as const,
    },
  ];

  // Stats Data
  const stats = [
    {
      icon: Film,
      value: "12,847",
      label: "Movie NFTs",
      suffix: "+",
      color: "text-blue-400",
    },
    {
      icon: Users,
      value: "8,392",
      label: "Active Creators",
      suffix: "+",
      color: "text-green-400",
    },
    {
      icon: TrendingUp,
      value: "$2.4M",
      label: "Volume Traded",
      suffix: "",
      color: "text-purple-400",
    },
    {
      icon: Zap,
      value: "98.5%",
      label: "Satisfaction Rate",
      suffix: "",
      color: "text-yellow-400",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-scale-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const statElements = sectionRef.current?.querySelectorAll(".stat-card");
    statElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-0">
      {/* Featured Collections Section */}
      <section className="section-padding bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-glow">
              Featured Collections
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover curated collections of premium movie NFTs from top
              creators and studios
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {collections.map((collection, index) => {
              const IconComponent = collection.icon;
              return (
                <div
                  key={index}
                  className="nft-card group animate-slide-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-6">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-56 object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Badge */}
                    <Badge
                      className={`absolute top-4 left-4 ${collection.color} border-current/30 bg-current/10 backdrop-blur-sm`}
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {collection.badge}
                    </Badge>

                    {/* Hover Stats */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-100 scale-90">
                      <div className="glassmorphism p-4 text-center rounded-2xl">
                        <div className="text-2xl font-bold text-primary">
                          {collection.items}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Items
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                        {collection.name}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {collection.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Floor Price
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {collection.floorPrice} ETH
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                      >
                        View Collection
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="btn-glow border-primary/30 hover:border-primary/60 text-lg px-8 py-4 hover:scale-105 transition-all duration-300"
            >
              View All Collections
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Movies Section */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12 animate-fade-in">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-glow flex items-center gap-3">
                <TrendingUp className="h-10 w-10 text-primary" />
                Trending Movies
              </h2>
              <p className="text-xl text-muted-foreground mt-2">
                Most popular movie NFTs this week
              </p>
            </div>
            <Button
              variant="outline"
              className="border-primary/30 hover:border-primary/60 hover:bg-primary/10 group"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingNFTs.map((nft, index) => (
              <NFTCard
                key={index}
                {...nft}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="btn-glow text-lg px-8 py-4 hover:scale-105 transition-all duration-300"
            >
              Explore More Content
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Statistics Section */}
      <section
        ref={sectionRef}
        className="section-padding bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-glow mb-4">
              Platform Statistics
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of creators and collectors in the world's leading
              movie marketplace
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="stat-card glassmorphism p-8 text-center group hover:scale-105 transition-all duration-500 cursor-pointer"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="relative mb-6">
                    <IconComponent
                      className={`h-12 w-12 ${stat.color} mx-auto group-hover:scale-110 transition-transform duration-300`}
                    />
                    <div
                      className={`absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`}
                      style={{
                        backgroundColor: stat.color.replace("text-", ""),
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`text-4xl font-bold ${stat.color} text-glow`}
                    >
                      {stat.value}
                      {stat.suffix}
                    </div>
                    <div className="text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl -z-10" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
