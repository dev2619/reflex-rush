/**
 * Input system — swipe gesture parsing and callbacks.
 */

import type { SwipeDirection } from '../core/types';

export type SwipeHandler = (direction: SwipeDirection) => void;

export interface InputSystemAPI {
  setSwipeHandler: (handler: SwipeHandler | null) => void;
  /** For gesture handler: pass gesture state and get resolved direction or null */
  resolveSwipe: (dx: number, dy: number) => SwipeDirection | null;
}

const MIN_SWIPE_PX = 50;
const MAX_VERTICAL_FOR_HORIZONTAL = 0.6;
const MAX_HORIZONTAL_FOR_VERTICAL = 0.6;

export function createInputSystem(): InputSystemAPI {
  let handler: SwipeHandler | null = null;

  function computeDirection(dx: number, dy: number): SwipeDirection | null {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const total = Math.hypot(dx, dy);
    if (total < MIN_SWIPE_PX) return null;
    if (absX >= absY) {
      if (absY / absX > MAX_VERTICAL_FOR_HORIZONTAL) return null;
      return dx > 0 ? 'right' : 'left';
    }
    if (absX / absY > MAX_HORIZONTAL_FOR_VERTICAL) return null;
    return dy > 0 ? 'down' : 'up';
  }

  return {
    setSwipeHandler(h: SwipeHandler | null) {
      handler = h;
    },
    resolveSwipe(dx: number, dy: number) {
      const dir = computeDirection(dx, dy);
      if (dir && handler) handler(dir);
      return dir;
    },
  };
}
