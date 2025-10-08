import clsx from "clsx";
import { useGamePlayback } from "narraleaf/renderer";
import React, { useEffect } from "react";
import { useRouter } from "narraleaf-react";
import { AnimatePresence, motion } from "motion/react";

// Interface for panel component properties
interface PanelProps {
  children: React.ReactNode;
  route?: boolean;
  className?: string;
}

// Panel component with escape key handling and responsive layout
const Panel: React.FC<PanelProps> = ({ children, className = "", route = true }) => {
  const { isPlaying } = useGamePlayback();
  const router = useRouter();

  // Handle escape key to go back when routing is enabled
  useEffect(() => {
    if (!route) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
        cleanUp();
      }
    };
    const cleanUp = () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

    window.addEventListener("keydown", handleKeyDown);
    return cleanUp;
  }, [router, route]);

  return (
    <AnimatePresence>
      {/* Responsive panel that adjusts width based on game playback state */}
      <motion.div
        className={clsx(`absolute top-0 h-full bg-black/50 shadow-2xl ${className} p-4`,
          isPlaying ? `w-full` : "w-1/3 left-8",
        )}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default Panel;



