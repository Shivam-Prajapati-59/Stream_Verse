import VideoGallery from "@/components/custom/VideoGallery";
import React from "react";

const ExplorePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
            Explore Content
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing videos from creators around the world. Purchase and
            stream premium content using blockchain technology.
          </p>
        </div>

        <VideoGallery />
      </div>
    </div>
  );
};

export default ExplorePage;
