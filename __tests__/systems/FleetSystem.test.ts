/**
 * TDD: FleetSystem — getFleetShips, updateFleetFormation.
 */

import { getFleetShips, updateFleetFormation } from '../../src/systems/FleetSystem';
import { createPlayerShip, createDroneShip } from '../../src/entities/PlayerShip';
import { EntityKind } from '../../src/core/types';

const W = 400;
const H = 800;

describe('FleetSystem', () => {
  describe('getFleetShips', () => {
    it('returns only PlayerShip and DroneShip entities', () => {
      const leader = createPlayerShip(W, H);
      const drone = createDroneShip(W, H, 1, leader.bounds);
      const fleet = [leader, drone];
      const ships = getFleetShips(fleet);
      expect(ships).toHaveLength(2);
      expect(ships[0].kind).toBe(EntityKind.PlayerShip);
      expect(ships[1].kind).toBe(EntityKind.DroneShip);
    });

    it('filters out non-ship entities when mixed', () => {
      const leader = createPlayerShip(W, H);
      const other = { id: 'x', kind: EntityKind.Meteor, bounds: leader.bounds };
      const ships = getFleetShips([leader, other as any]);
      expect(ships).toHaveLength(1);
    });
  });

  describe('updateFleetFormation', () => {
    it('positions drone behind and offset from leader', () => {
      const leader = createPlayerShip(W, H);
      const drone = createDroneShip(W, H, 1, leader.bounds);
      leader.bounds.x = 100;
      leader.bounds.y = 500;
      updateFleetFormation([leader, drone], leader.bounds, W, H);
      expect(drone.bounds.y).toBeGreaterThanOrEqual(leader.bounds.y + leader.bounds.height);
      expect(drone.bounds.x).toBeGreaterThanOrEqual(0);
      expect(drone.bounds.x + drone.bounds.width).toBeLessThanOrEqual(W);
    });

    it('does nothing when fleet has no leader', () => {
      const drone = createDroneShip(W, H, 1, { x: 100, y: 500, width: 20, height: 15 });
      const beforeY = drone.bounds.y;
      updateFleetFormation([drone], { x: 100, y: 500, width: 20, height: 15 }, W, H);
      expect(drone.bounds.y).toBe(beforeY);
    });
  });
});
