import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// X402 Payment configuration
const CHUNK_PRICE = "$0.001"; // Price per 10-second chunk
const PAYMENT_RECEIVER = "0x6B66b8bcB45a802FA58bcC97521bb487BA36917f";
const NETWORK = "polygon-amoy";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chunkIndex = searchParams.get("chunk");
    const commp = searchParams.get("commp");

    // For X402 payments, we need to validate payment here
    // In a real implementation, you would use paymentMiddleware
    console.log(`Payment request for chunk ${chunkIndex}, commp: ${commp}`);

    // Path to the video file (in production, this would come from Synapse)
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

    // Calculate chunk boundaries for 10-second segments
    const totalChunks = Math.ceil(120 / 10); // Assume 2-minute video, 10-second chunks
    const chunkSize = Math.ceil(fileSize / totalChunks);

    if (chunkIndex !== null) {
      const chunkNum = parseInt(chunkIndex, 10);
      if (chunkNum >= totalChunks) {
        return NextResponse.json(
          { error: "Chunk index out of range" },
          { status: 416 }
        );
      }

      // Calculate chunk boundaries
      const start = chunkNum * chunkSize;
      const end = Math.min(start + chunkSize - 1, fileSize - 1);
      const actualChunkSize = end - start + 1;

      // Read the specific chunk
      const file = await fs.open(videoPath, "r");
      const buffer = Buffer.alloc(actualChunkSize);
      await file.read(buffer, 0, actualChunkSize, start);
      await file.close();

      // Return the chunk with payment headers
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Length": actualChunkSize.toString(),
          "Content-Type": "video/mp4",
          "X-Payment-Required": "true",
          "X-Payment-Amount": CHUNK_PRICE,
          "X-Payment-Network": NETWORK,
          "X-Payment-Receiver": PAYMENT_RECEIVER,
          "X-Chunk-Index": chunkIndex,
          "X-Total-Chunks": totalChunks.toString(),
          "Cache-Control": "no-cache",
        },
      });
    }

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
