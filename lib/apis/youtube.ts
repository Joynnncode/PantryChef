const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

// YouTube's free quota is the tightest in the stack (~100 searches/day at
// 100 units/call on a fresh project), so we cache aggressively.
const SEARCH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface VideoResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error(
      "YOUTUBE_API_KEY is not set. Get a free key from Google Cloud Console (YouTube Data API v3) and add it to .env.local"
    );
  }
  return key;
}

export async function searchCookingVideos(
  query: string,
  limit = 6
): Promise<VideoResult[]> {
  const params = new URLSearchParams({
    key: getApiKey(),
    q: `${query} recipe tutorial`,
    part: "snippet",
    type: "video",
    maxResults: String(limit),
    safeSearch: "strict",
    videoEmbeddable: "true",
  });

  const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    next: { revalidate: SEARCH_TTL_SECONDS },
  });

  if (!res.ok) {
    // Quota exhaustion (403) or other upstream failure — caller should
    // degrade gracefully rather than surface a hard error to the user.
    throw new Error(`YouTube search failed: ${res.status}`);
  }

  const data: {
    items: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        channelTitle: string;
        thumbnails: { medium?: { url: string }; default?: { url: string } };
      };
    }>;
  } = await res.json();

  return data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnailUrl:
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      "",
  }));
}
