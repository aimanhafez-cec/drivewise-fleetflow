import { useEffect, useRef, useState } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance for swipe
  velocityThreshold?: number; // Minimum velocity for swipe
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

/**
 * Hook to handle touch gestures (swipe left/right/up/down)
 * Useful for mobile wizard navigation and card interactions
 */
export function useTouchGestures<T extends HTMLElement = HTMLDivElement>(
  options: TouchGestureOptions = {}
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocityThreshold = 0.3,
  } = options;

  const ref = useRef<T>(null);
  const touchStart = useRef<TouchPosition | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      setIsSwiping(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStart.current.x);
      const deltaY = Math.abs(touch.clientY - touchStart.current.y);

      // Detect if user is swiping
      if (deltaX > 10 || deltaY > 10) {
        setIsSwiping(true);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      const deltaTime = Date.now() - touchStart.current.time;

      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold && velocityX > velocityThreshold) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold && velocityY > velocityThreshold) {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      touchStart.current = null;
      setIsSwiping(false);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocityThreshold]);

  return {
    ref,
    isSwiping,
  };
}

/**
 * Hook to detect if device is touch-enabled
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);

    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
}

/**
 * Hook for long press gesture
 */
export function useLongPress(
  onLongPress: () => void,
  options: { delay?: number; onStart?: () => void; onCancel?: () => void } = {}
) {
  const { delay = 500, onStart, onCancel } = options;
  const timerRef = useRef<NodeJS.Timeout>();
  const isLongPress = useRef(false);

  const start = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isLongPress.current = false;
    onStart?.();

    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, delay);
  };

  const clear = (shouldCancel = true) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (shouldCancel && !isLongPress.current) {
      onCancel?.();
    }
  };

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: () => clear(true),
    onMouseLeave: () => clear(false),
    onTouchEnd: () => clear(true),
  };
}
