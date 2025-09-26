import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // Path to the video file
    const videoPath = path.join(process.cwd(), "public", "videos", "video.dat");

    // Check if file exists
    try {
      await fs.access(videoPath);
    } catch (error) {
      return NextResponse.json(
        { error: "Video file not found" },
        { status: 404 }
      );
    }

    // Get file stats
    const stats = await fs.stat(videoPath);
    const fileSize = stats.size;

    // Parse range header for video streaming
    const range = request.headers.get("range");

    if (range) {
      // Handle range requests for video streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      // Read the chunk
      const file = await fs.open(videoPath, "r");
      const buffer = Buffer.alloc(chunksize);
      await file.read(buffer, 0, chunksize, start);
      await file.close();

      // Return partial content
      return new NextResponse(new Uint8Array(buffer), {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": "video/mp4", // Assuming it's an MP4 file
        },
      });
    } else {
      // Return entire file
      const buffer = await fs.readFile(videoPath);

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Length": fileSize.toString(),
          "Content-Type": "video/mp4", // Assuming it's an MP4 file
          "Accept-Ranges": "bytes",
        },
      });
    }
  } catch (error) {
    console.error("Error streaming video:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
