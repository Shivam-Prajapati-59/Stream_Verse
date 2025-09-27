import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Hello from Stream Verse</h1>
      </div>
      <Button>Hello</Button>
      {/* <VideoPlayer /> */}
    </div>
  );
}
