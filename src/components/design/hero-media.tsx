"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";

export type HeroVideoSources = {
  webm?: string;
  mp4?: string;
};

type HeroMediaProps = {
  poster: string;
  alt: string;
  videoSrc?: HeroVideoSources;
};

function subscribeSaveData() {
  return () => {};
}

function readSaveData() {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return Boolean(connection?.saveData);
}

export function HeroMedia({ poster, alt, videoSrc }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveData = useSyncExternalStore(
    subscribeSaveData,
    readSaveData,
    () => false,
  );
  const reduce = useSyncExternalStore(
    (onStoreChange) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      query.addEventListener("change", onStoreChange);
      return () => query.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const hasVideo = Boolean(videoSrc?.webm || videoSrc?.mp4);
  const showVideo = hasVideo && !saveData && !reduce;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video.play().catch(() => {});
          return;
        }
        video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [showVideo]);

  return (
    <>
      <Image
        src={poster}
        alt={alt}
        fill
        preload
        sizes="100vw"
        className="object-cover"
      />
      {showVideo && videoSrc ? (
        <video
          ref={videoRef}
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          className="absolute inset-0 h-full w-full object-cover"
        >
          {videoSrc.webm ? (
            <source src={videoSrc.webm} type="video/webm" />
          ) : null}
          {videoSrc.mp4 ? <source src={videoSrc.mp4} type="video/mp4" /> : null}
        </video>
      ) : null}
    </>
  );
}
