"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, X } from "lucide-react";

export function CompactPhotosTray({ photos }: { photos: string[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!photos.length) return null;

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {photos.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelectedPhoto(url)}
            className="group relative aspect-[4/5] h-24 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-zinc-950 shadow-2xs active:scale-95 transition-transform cursor-pointer"
          >
            <Image
              src={url}
              alt={`Deck photo ${i + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
            {i === 0 && (
              <span className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-emerald-600/90 px-1.5 py-0.2 text-[8px] font-bold text-white shadow-xs">
                <Star className="w-2 h-2 fill-current" /> Main
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Fullscreen Photo Lightbox */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative aspect-[4/5] max-h-[80dvh] w-full max-w-xs overflow-hidden rounded-3xl border border-zinc-800 shadow-2xl">
            <Image
              src={selectedPhoto}
              alt="Deck photo view"
              fill
              className="object-cover"
              sizes="320px"
            />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
