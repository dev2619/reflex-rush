/**
 * TDD: CollisionSystem — AABB intersect y distanceBetween.
 */

import { intersectAABB, distanceBetween } from '../../src/engine/CollisionSystem';
import type { Bounds } from '../../src/core/types';

describe('CollisionSystem', () => {
  describe('intersectAABB', () => {
    it('returns true when rectangles overlap', () => {
      const a: Bounds = { x: 0, y: 0, width: 10, height: 10 };
      const b: Bounds = { x: 5, y: 5, width: 10, height: 10 };
      expect(intersectAABB(a, b)).toBe(true);
      expect(intersectAABB(b, a)).toBe(true);
    });

    it('returns false when rectangles do not overlap', () => {
      const a: Bounds = { x: 0, y: 0, width: 10, height: 10 };
      const b: Bounds = { x: 15, y: 0, width: 10, height: 10 };
      expect(intersectAABB(a, b)).toBe(false);
    });

    it('returns false when only touching on edge (no overlap)', () => {
      const a: Bounds = { x: 0, y: 0, width: 10, height: 10 };
      const b: Bounds = { x: 10, y: 0, width: 10, height: 10 };
      expect(intersectAABB(a, b)).toBe(false);
    });
  });

  describe('distanceBetween', () => {
    it('returns 0 for same center', () => {
      const a: Bounds = { x: 0, y: 0, width: 10, height: 10 };
      const b: Bounds = { x: 0, y: 0, width: 10, height: 10 };
      expect(distanceBetween(a, b)).toBe(0);
    });

    it('returns positive distance for separated bounds (center to center)', () => {
      const a: Bounds = { x: 0, y: 0, width: 10, height: 10 };
      const b: Bounds = { x: 20, y: 0, width: 10, height: 10 };
      expect(distanceBetween(a, b)).toBe(20);
    });
  });
});
