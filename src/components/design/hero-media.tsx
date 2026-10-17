"use client";

import Image, { getImageProps } from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";

export type HeroVideoSources = {
  webm?: string;
  mp4?: string;
  mobileMp4?: string;
  desktopMp4?: string;
};

type HeroMediaProps = {
  poster: string;
  mobilePoster?: string;
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

export function HeroMedia({
  poster,
  mobilePoster,
  alt,
  videoSrc,
}: HeroMediaProps) {
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
  const hasVideo = Boolean(
    videoSrc?.webm ||
    videoSrc?.mp4 ||
    videoSrc?.mobileMp4 ||
    videoSrc?.desktopMp4,
  );
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

  if (mobilePoster) {
    const common = {
      alt,
      fill: true,
      preload: true,
      sizes: "100vw",
      className: "object-cover",
    };
    const {
      props: { srcSet: mobileSrcSet },
    } = getImageProps({
      ...common,
      src: mobilePoster,
    });
    const {
      props: { ...desktopProps },
    } = getImageProps({
      ...common,
      fetchPriority: "high",
      src: poster,
    });

    return (
      <>
        <picture className="absolute inset-0 block h-full w-full">
          <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
          <img {...desktopProps} alt={alt} />
        </picture>
        {showVideo && videoSrc ? (
          <video
            ref={videoRef}
            aria-hidden="true"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          >
            {videoSrc.mobileMp4 ? (
              <source
                src={videoSrc.mobileMp4}
                type="video/mp4"
                media="(max-width: 767px)"
              />
            ) : null}
            {videoSrc.desktopMp4 ? (
              <source
                src={videoSrc.desktopMp4}
                type="video/mp4"
                media="(min-width: 768px)"
              />
            ) : null}
            {videoSrc.webm ? (
              <source src={videoSrc.webm} type="video/webm" />
            ) : null}
            {videoSrc.mp4 ? (
              <source src={videoSrc.mp4} type="video/mp4" />
            ) : null}
          </video>
        ) : null}
      </>
    );
  }

  return (
    <>
      <Image
        src={poster}
        alt={alt}
        fill
        preload
        fetchPriority="high"
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
