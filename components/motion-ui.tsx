"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type MotionPageProps = {
  children: React.ReactNode;
  className?: string;
};

export function MotionPage({ children, className }: MotionPageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type MotionRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function MotionReveal({ children, className, delay = 0 }: MotionRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type MotionPressableProps = {
  children: React.ReactNode;
  className?: string;
};

export function MotionPressable({ children, className }: MotionPressableProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      layout
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
