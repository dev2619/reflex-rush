/**
 * TDD: PlayerShip — createPlayerShip, createDroneShip, clampShipToBounds.
 */

import {
  createPlayerShip,
  createDroneShip,
  clampShipToBounds,
} from '../../src/entities/PlayerShip';
import { EntityKind } from '../../src/core/types';

const W = 400;
const H = 800;

describe('PlayerShip', () => {
  describe('createPlayerShip', () => {
    it('returns entity with kind PlayerShip and bounds inside screen', () => {
      const ship = createPlayerShip(W, H);
      expect(ship.kind).toBe(EntityKind.PlayerShip);
      expect(ship.bounds.width).toBeGreaterThan(0);
      expect(ship.bounds.height).toBeGreaterThan(0);
      expect(ship.bounds.x).toBeGreaterThanOrEqual(0);
      expect(ship.bounds.y).toBeGreaterThanOrEqual(0);
      expect(ship.bounds.x + ship.bounds.width).toBeLessThanOrEqual(W);
      expect(ship.bounds.y + ship.bounds.height).toBeLessThanOrEqual(H);
    });

    it('centers ship horizontally', () => {
      const ship = createPlayerShip(W, H);
      const centerX = ship.bounds.x + ship.bounds.width / 2;
      expect(Math.abs(centerX - W / 2)).toBeLessThan(2);
    });

    it('accepts fleetIndex and weaponPattern', () => {
      const ship = createPlayerShip(W, H, { fleetIndex: 0, weaponPattern: 'double' });
      expect(ship.fleetIndex).toBe(0);
      expect(ship.weaponPattern).toBe('double');
    });

    it('has shieldActive false by default', () => {
      const ship = createPlayerShip(W, H);
      expect(ship.shieldActive).toBe(false);
    });
  });

  describe('createDroneShip', () => {
    it('returns entity with kind DroneShip and position behind leader', () => {
      const leader = createPlayerShip(W, H);
      const drone = createDroneShip(W, H, 1, leader.bounds);
      expect(drone.kind).toBe(EntityKind.DroneShip);
      expect(drone.bounds.y).toBeGreaterThanOrEqual(leader.bounds.y + leader.bounds.height);
      expect(drone.fleetIndex).toBe(1);
    });
  });

  describe('clampShipToBounds', () => {
    it('clamps x to [0, gameWidth - width]', () => {
      const bounds = { x: -10, y: 100, width: 20, height: 15 };
      const out = clampShipToBounds(bounds, W, H);
      expect(out.x).toBe(0);
      expect(out.y).toBe(100);
    });

    it('clamps right edge to gameWidth', () => {
      const bounds = { x: W + 5, y: 100, width: 20, height: 15 };
      const out = clampShipToBounds(bounds, W, H);
      expect(out.x).toBe(W - 20);
    });

    it('clamps y to [0, gameHeight - height]', () => {
      const bounds = { x: 100, y: -5, width: 20, height: 15 };
      const out = clampShipToBounds(bounds, W, H);
      expect(out.y).toBe(0);
    });

    it('leaves in-bounds values unchanged', () => {
      const bounds = { x: 100, y: 200, width: 20, height: 15 };
      const out = clampShipToBounds(bounds, W, H);
      expect(out.x).toBe(100);
      expect(out.y).toBe(200);
    });
  });
});
