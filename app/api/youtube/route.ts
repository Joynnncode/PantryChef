import { NextRequest, NextResponse } from "next/server";
import { searchCookingVideos } from "@/lib/apis/youtube";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Provide a 'q' query param." }, { status: 400 });
  }

  try {
    const videos = await searchCookingVideos(query);
    return NextResponse.json({ videos });
  } catch (error) {
    console.error("[/api/youtube]", error);
    // Degrade gracefully: an empty list lets the UI hide the video section
    // instead of blocking recipe results when the quota is exhausted.
    return NextResponse.json({ videos: [], degraded: true });
  }
}
