"use client";

import Image, { getImageProps } from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import ReactDOM from "react-dom";

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
  const [posterLoaded, setPosterLoaded] = useState(false);
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
  const canPlayVideo = hasVideo && !saveData && !reduce;
  const activateVideo = canPlayVideo && posterLoaded;

  useEffect(() => {
    if (!canPlayVideo) return;

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const scheduleIdle = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(() => setPosterLoaded(true), {
          timeout: 1500,
        });
      } else {
        timeoutId = setTimeout(() => setPosterLoaded(true), 200) as unknown as number;
      }
    };

    if (document.readyState === "complete") {
      scheduleIdle();
    } else {
      window.addEventListener("load", scheduleIdle, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleIdle);
      if (
        idleId !== undefined &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [canPlayVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activateVideo) return;

    video.load();
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
  }, [activateVideo]);

  if (mobilePoster) {
    const common = {
      alt,
      fill: true,
      sizes: "100vw",
      className: "object-cover",
    };
    const {
      props: { src: mobileSrc, srcSet: mobileSrcSet, sizes: mobileSizes },
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

    if (mobileSrcSet) {
      ReactDOM.preload(mobileSrc, {
        as: "image",
        imageSrcSet: mobileSrcSet,
        imageSizes: mobileSizes ?? "100vw",
        media: "(max-width: 767px)",
        fetchPriority: "high",
      });
    }
    if (desktopProps.srcSet) {
      ReactDOM.preload(desktopProps.src, {
        as: "image",
        imageSrcSet: desktopProps.srcSet,
        imageSizes: desktopProps.sizes ?? "100vw",
        media: "(min-width: 768px)",
        fetchPriority: "high",
      });
    }

    return (
      <>
        <picture className="absolute inset-0 block h-full w-full">
          <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
          <img
            {...desktopProps}
            alt={alt}
            onLoad={() => setPosterLoaded(true)}
          />
        </picture>
        {hasVideo && videoSrc ? (
          <video
            ref={videoRef}
            aria-hidden="true"
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 h-full w-full object-cover"
          >
            {activateVideo ? (
              <>
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
              </>
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
        onLoad={() => setPosterLoaded(true)}
      />
      {hasVideo && videoSrc ? (
        <video
          ref={videoRef}
          aria-hidden="true"
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
          className="absolute inset-0 h-full w-full object-cover"
        >
          {activateVideo ? (
            <>
              {videoSrc.webm ? (
                <source src={videoSrc.webm} type="video/webm" />
              ) : null}
              {videoSrc.mp4 ? (
                <source src={videoSrc.mp4} type="video/mp4" />
              ) : null}
            </>
          ) : null}
        </video>
      ) : null}
    </>
  );
}
