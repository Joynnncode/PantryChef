"use client";

import { useState } from "react";
import type { VideoResult } from "@/lib/apis/youtube";

export function YouTubeEmbed({ video }: { video: VideoResult }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl border border-border">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-border text-left"
      aria-label={`Play ${video.title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary-700 shadow">
          ▶
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <span className="line-clamp-2 text-sm font-medium text-white">{video.title}</span>
      </span>
    </button>
  );
}
