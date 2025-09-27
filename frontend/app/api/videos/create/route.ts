import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { publicAddress, title, cid } = body;

    if (!publicAddress || !title || !cid) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          required: ["publicAddress", "title", "cid"],
        },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(publicAddress)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Ethereum address format",
        },
        { status: 400 }
      );
    }

    // Forward request to backend server
    const response = await fetch(`${SERVER_URL}/api/videos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Server responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);

    // Handle different error types
    if (error instanceof Error && error.message.includes("23505")) {
      return NextResponse.json(
        {
          success: false,
          error: "Video with this CID already exists",
          message:
            "A video with this content identifier is already in the database",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create video",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
