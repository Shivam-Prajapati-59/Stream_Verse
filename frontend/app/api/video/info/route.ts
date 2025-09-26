import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    // Path to the video file
    const videoPath = path.join(process.cwd(), "public", "videos", "video.dat");

    // Check if file exists and get stats
    try {
      const stats = await fs.stat(videoPath);

      // Convert bytes to MB
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      return NextResponse.json({
        success: true,
        fileInfo: {
          name: "video.dat",
          size: `${fileSizeInMB} MB`,
          sizeInBytes: stats.size,
          lastModified: stats.mtime.toISOString(),
          type: "Binary Video File",
          exists: true,
        },
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        fileInfo: {
          name: "video.dat",
          exists: false,
          error: "File not found",
        },
      });
    }
  } catch (error) {
    console.error("Error getting file info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
