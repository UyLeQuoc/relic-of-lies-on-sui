"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useAnimate } from "framer-motion";
import Image from "next/image";

interface PullButtonProps {
  count: 1 | 10;
  cost: number;
  disabled: boolean;
  isLoading: boolean;
  onClick: () => void;
  className?: string;
}

const Loader = () => {
  return (
    <motion.svg
      animate={{
        rotate: [0, 360],
      }}
      initial={{
        scale: 0,
        width: 0,
        display: "none",
      }}
      style={{
        scale: 0.5,
        display: "none",
      }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
        ease: "linear",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="loader text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 3a9 9 0 1 0 9 9" />
    </motion.svg>
  );
};

const CheckIcon = () => {
  return (
    <motion.svg
      initial={{
        scale: 0,
        width: 0,
        display: "none",
      }}
      style={{
        scale: 0.5,
        display: "none",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="check text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M9 12l2 2l4 -4" />
    </motion.svg>
  );
};

export function PullButton({
  count,
  cost,
  disabled,
  isLoading,
  onClick,
  className,
}: PullButtonProps) {
  const [scope, animate] = useAnimate();
  const is10Pull = count === 10;

    const animateLoading = async () => {
      await animate(
        ".loader",
        {
          width: "20px",
          scale: 1,
          display: "block",
        },
        {
          duration: 0.2,
        }
      );
    };

    const animateSuccess = async () => {
      await animate(
        ".loader",
        {
          width: "0px",
          scale: 0,
          display: "none",
        },
        {
          duration: 0.2,
        }
      );
      await animate(
        ".check",
        {
          width: "20px",
          scale: 1,
          display: "block",
        },
        {
          duration: 0.2,
        }
      );

      await animate(
        ".check",
        {
          width: "0px",
          scale: 0,
          display: "none",
        },
        {
          delay: 1,
          duration: 0.2,
        }
      );
    };

    const handleClick = async () => {
      if (disabled || isLoading) return;
      await animateLoading();
      await onClick();
      await animateSuccess();
    };

    return (
      <motion.button
        layout
        ref={scope}
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={cn(
          "w-48 h-14 text-lg relative overflow-hidden rounded-full font-medium text-white cursor-pointer flex items-center justify-center gap-2",
          "ring-offset-2 transition duration-200",
          "bg-primary/5 border border-primary hover:bg-primary/90 ",
          is10Pull &&
            "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none",
          "hover:ring-2 hover:ring-primary hover:ring-offset-2",
          is10Pull && "hover:ring-purple-500",
          (disabled || isLoading) && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <motion.div layout className="flex items-center justify-center gap-2">
          <Loader />
          <CheckIcon />
          <motion.span layout className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            x{count}
          </motion.span>
        </motion.div>
        <div className="flex items-center gap-1">
        <Image
              src="/images/logo/sui-sui-logo.svg"
              alt="SUI"
              width={24}
              height={24}
              className="inline-block size-4"
            />
          {cost} 
          
        </div>
      </motion.button>
    );
}
