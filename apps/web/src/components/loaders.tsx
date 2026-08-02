import { motion } from "motion/react";

const dots = [0, 1, 2, 3];

export function LoadingDots() {
  return (
    <div className="flex items-center gap-2">
      {dots.map((dot) => (
        <motion.div
          key={dot}
          className="h-2 w-2 rounded-full bg-mint"
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot * 0.12,
          }}
        />
      ))}
    </div>
  );
}
