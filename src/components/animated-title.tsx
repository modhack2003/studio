'use client';

import { motion } from 'framer-motion';

interface AnimatedTitleProps {
  title: string;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const bracketVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function AnimatedTitle({ title, className }: AnimatedTitleProps) {
  return (
    <motion.h2
      className={`font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-glow ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      <motion.svg
        width="15"
        height="40"
        viewBox="0 0 15 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'inline-block' }}
      >
        <motion.path
          d="M12 3L4 10V30L12 37"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          variants={bracketVariants}
        />
      </motion.svg>
      <motion.span variants={textVariants} className="mx-2">
        {title}
      </motion.span>
      <motion.svg
        width="15"
        height="40"
        viewBox="0 0 15 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'inline-block' }}
      >
        <motion.path
          d="M3 3L11 10V30L3 37"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          variants={bracketVariants}
        />
      </motion.svg>
    </motion.h2>
  );
}