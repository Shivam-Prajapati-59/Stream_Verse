import { NextRequest, NextResponse } from "next/server";

// Mock video data - in a real app, this would come from a database
const videoDatabase = [
  {
    id: "1",
    title: "Premium Video 1",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    description: "High-quality premium video content",
    duration: "10:34",
    price: "$0.01",
  },
  {
    id: "2",
    title: "Premium Video 2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    description: "Exclusive video content",
    duration: "15:42",
    price: "$0.01",
  },
  {
    id: "3",
    title: "Premium Video 3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "Premium streaming content",
    duration: "8:12",
    price: "$0.01",
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("id");

  try {
    if (videoId) {
      // Get specific video by ID
      const video = videoDatabase.find((v) => v.id === videoId);

      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }

      // If we reach this point, payment was successful (middleware handled it)
      return NextResponse.json({
        success: true,
        video: {
          id: video.id,
          title: video.title,
          url: video.url,
          description: video.description,
          duration: video.duration,
        },
        message: "Payment successful - Video access granted",
      });
    } else {
      // Get all videos (preview without URLs)
      const videoList = videoDatabase.map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        duration: video.duration,
        price: video.price,
        // Don't include URL in the list - requires payment to access
      }));

      return NextResponse.json({
        success: true,
        videos: videoList,
        message: "Video list retrieved successfully",
      });
    }
  } catch (error) {
    console.error("Error in video API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Handle video upload or other operations
  return NextResponse.json(
    { error: "Method not implemented" },
    { status: 501 }
  );
}
