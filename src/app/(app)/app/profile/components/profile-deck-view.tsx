"use client";

import { useState } from "react";
import Image from "next/image";
import { ShieldCheck, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

interface ProfileDeckViewProps {
  photos: string[];
  displayName: string;
  age: number | null;
  department: string | null;
  academicYear: string | null;
  gender: string | null;
  campusResidency?: string | null;
  bio?: string | null;
  isVerified: boolean;
}

export function ProfileDeckView({
  photos,
  displayName,
  age,
  department,
  academicYear,
  gender,
  campusResidency,
  bio,
  isVerified,
}: ProfileDeckViewProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => Math.max(0, prev - 1));
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => Math.min(photos.length - 1, prev + 1));
  };

  return (
    <div className="space-y-2">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border-2 border-border/80 bg-zinc-950 shadow-xl">
        {photos[photoIndex] ? (
          <Image
            src={photos[photoIndex]}
            alt={displayName}
            fill
            priority
            className="object-cover transition-all duration-200"
            sizes="(max-width: 640px) 100vw, 420px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold text-white bg-gradient-to-br from-emerald-600 to-teal-700 text-6xl">
            {displayName.charAt(0) ?? "?"}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

        {photos.length > 1 && (
          <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5 pointer-events-none">
            {photos.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/30 backdrop-blur-xs"
              >
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    idx <= photoIndex ? "bg-white" : "bg-transparent"
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="absolute top-6 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-emerald-400 backdrop-blur-md border border-white/15">
            <ShieldCheck className="h-3 w-3" /> {isVerified ? "Verified Student" : "Student"}
          </div>
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/15">
            {photoIndex + 1} / {photos.length}
          </span>
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              disabled={photoIndex === 0}
              className="absolute left-0 top-14 bottom-32 z-20 w-1/2 cursor-pointer disabled:cursor-default"
              aria-label="Previous photo"
            />
            <button
              type="button"
              onClick={nextPhoto}
              disabled={photoIndex === photos.length - 1}
              className="absolute right-0 top-14 bottom-32 z-20 w-1/2 cursor-pointer disabled:cursor-default"
              aria-label="Next photo"
            />

            {photoIndex > 0 && (
              <div className="pointer-events-none absolute left-2.5 top-1/2 z-20 -translate-y-1/2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs">
                  <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
                </div>
              </div>
            )}

            {photoIndex < photos.length - 1 && (
              <div className="pointer-events-none absolute right-2.5 top-1/2 z-20 -translate-y-1/2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs">
                  <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                </div>
              </div>
            )}
          </>
        )}

        <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5 pointer-events-none z-10">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-2xl font-black tracking-tight">
              {displayName}
              {age !== null && <span className="font-light text-xl opacity-90">, {age}</span>}
            </h2>
            {department && (
              <span className="rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-xs backdrop-blur-md">
                {department}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            {academicYear && <span>{academicYear}</span>}
            {gender && <span>• {gender}</span>}
            {campusResidency && (
              <span className="flex items-center gap-0.5 text-zinc-300">
                <MapPin className="w-2.5 h-2.5" /> {campusResidency}
              </span>
            )}
          </div>

          {bio && (
            <p className="text-xs text-white/90 line-clamp-2 leading-relaxed pt-0.5">
              &ldquo;{bio}&rdquo;
            </p>
          )}
        </div>
      </div>

      {photos.length > 1 && (
        <div className="grid grid-cols-6 gap-1.5 px-1">
          {photos.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPhotoIndex(i)}
              className={`relative aspect-[4/5] overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                photoIndex === i
                  ? "border-emerald-500 ring-2 ring-emerald-500/30 scale-102"
                  : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={url}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="60px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
