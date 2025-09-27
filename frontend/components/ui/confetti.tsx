"use client";

import { useConfetti } from "@/hooks/useConfetti";
import { useEffect } from "react";

export const ConfettiDisplay = () => {
  const { showConfetti } = useConfetti();

  useEffect(() => {
    if (showConfetti) {
      // Create confetti elements
      const confettiContainer = document.createElement("div");
      confettiContainer.style.position = "fixed";
      confettiContainer.style.top = "0";
      confettiContainer.style.left = "0";
      confettiContainer.style.width = "100%";
      confettiContainer.style.height = "100%";
      confettiContainer.style.pointerEvents = "none";
      confettiContainer.style.zIndex = "9999";

      // Create multiple confetti pieces
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement("div");
        confetti.style.position = "absolute";
        confetti.style.width = "10px";
        confetti.style.height = "10px";
        confetti.style.backgroundColor = [
          "#ff6b6b",
          "#4ecdc4",
          "#45b7d1",
          "#96ceb4",
          "#ffeaa7",
        ][Math.floor(Math.random() * 5)];
        confetti.style.left = Math.random() * 100 + "%";
        confetti.style.top = "-10px";
        confetti.style.borderRadius = "50%";
        confetti.style.animation = `confetti-fall ${
          2 + Math.random() * 3
        }s linear forwards`;
        confettiContainer.appendChild(confetti);
      }

      // Add CSS animation keyframes
      const style = document.createElement("style");
      style.textContent = `
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 10px)) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(confettiContainer);

      // Cleanup after animation
      const cleanup = setTimeout(() => {
        if (document.body.contains(confettiContainer)) {
          document.body.removeChild(confettiContainer);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 5000);

      return () => {
        clearTimeout(cleanup);
        if (document.body.contains(confettiContainer)) {
          document.body.removeChild(confettiContainer);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, [showConfetti]);

  return null; // This component doesn't render anything visible directly
};
