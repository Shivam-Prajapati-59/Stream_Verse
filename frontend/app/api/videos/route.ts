import { NextRequest, NextResponse } from "next/server";
import { VideosApiResponse } from "@/types/videotypes";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${SERVER_URL}/api/videos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data: VideosApiResponse = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch videos",
        message: error instanceof Error ? error.message : "Unknown error",
        data: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
