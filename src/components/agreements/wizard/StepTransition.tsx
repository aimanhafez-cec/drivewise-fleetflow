import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepTransitionProps {
  children: React.ReactNode;
  stepKey: string | number;
  direction?: 'forward' | 'backward';
}

export const StepTransition: React.FC<StepTransitionProps> = ({
  children,
  stepKey,
  direction = 'forward',
}) => {
  const variants = {
    enter: (direction: string) => ({
      x: direction === 'forward' ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === 'forward' ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Alternative: Simple fade transition
export const SimpleFadeTransition: React.FC<{ children: React.ReactNode; stepKey: string | number }> = ({
  children,
  stepKey,
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
