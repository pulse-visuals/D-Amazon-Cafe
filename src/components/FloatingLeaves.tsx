"use client";

import { motion } from "framer-motion";

type Leaf = { left: string; top: string; size: number; duration: number; delay: number; rotate: number; opacity: number };

const LEAVES: Leaf[] = [
  { left: "6%", top: "12%", size: 34, duration: 9, delay: 0, rotate: -15, opacity: 0.5 },
  { left: "88%", top: "18%", size: 26, duration: 11, delay: 1.2, rotate: 20, opacity: 0.4 },
  { left: "16%", top: "68%", size: 22, duration: 8, delay: 0.6, rotate: 10, opacity: 0.35 },
  { left: "78%", top: "72%", size: 30, duration: 10, delay: 2, rotate: -25, opacity: 0.45 },
  { left: "48%", top: "8%", size: 20, duration: 7.5, delay: 1.6, rotate: 5, opacity: 0.3 },
  { left: "34%", top: "82%", size: 26, duration: 12, delay: 0.3, rotate: -10, opacity: 0.4 },
];

/**
 * Decorative floating tropical leaves. Purely presentational (aria-hidden),
 * and automatically frozen by the prefers-reduced-motion CSS rule in
 * globals.css, so it never becomes a distraction for motion-sensitive users.
 */
export function FloatingLeaves({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {LEAVES.map((leaf, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 64 64"
          style={{ left: leaf.left, top: leaf.top, width: leaf.size, height: leaf.size, opacity: leaf.opacity, position: "absolute" }}
          initial={{ y: 0, rotate: leaf.rotate }}
          animate={{ y: [0, -22, 0], rotate: [leaf.rotate, leaf.rotate + 12, leaf.rotate] }}
          transition={{ duration: leaf.duration, delay: leaf.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M32 2C18 10 6 24 6 40c0 12 10 22 26 22 4-14 10-24 24-34C48 12 40 4 32 2Z"
            fill="currentColor"
            className="text-jungle-200"
          />
          <path d="M32 4C24 20 22 40 24 60" stroke="currentColor" strokeWidth="1.4" className="text-jungle-400" fill="none" />
        </motion.svg>
      ))}
    </div>
  );
}
