"use client";

import React, { useRef, useEffect, useState } from "react";

interface VideoPlayerProps {
  src: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  width = "100%",
  height = "400px",
  autoPlay = false,
  controls = true,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setError("Failed to load video");
    };

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [src]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-800 text-white rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white rounded-lg"
          style={{ width, height }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div>Loading video...</div>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full rounded-lg"
        controls={controls}
        autoPlay={autoPlay}
        style={{ width, height }}
        title={title}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
