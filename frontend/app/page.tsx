import Hero from "@/components/custom/Hero";
import Marketplace from "@/components/custom/MarketPlace";

export default function Home() {
  return (
    <div className="min-h-screen space-y-0">
      <Hero />
      <Marketplace />
    </div>
  );
}
