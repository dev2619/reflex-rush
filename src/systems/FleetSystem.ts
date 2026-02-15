/**
 * Fleet system — formation positions for drone ships behind leader.
 */

import type { Entity } from '../entities/Entity';
import type { Bounds } from '../core/types';
import { EntityKind } from '../core/types';
import { FLEET_FORMATION_OFFSET_Y, FLEET_FORMATION_SPACING_X } from '../core/constants';

export function updateFleetFormation(
  fleet: Entity[],
  leaderBounds: Bounds,
  gameWidth: number,
  gameHeight: number
): void {
  const leader = fleet.find((e) => e.fleetIndex === 0 || e.kind === EntityKind.PlayerShip);
  if (!leader) return;

  const offsetY = gameHeight * FLEET_FORMATION_OFFSET_Y;
  const spacingX = gameWidth * FLEET_FORMATION_SPACING_X;

  let idx = 0;
  for (const ship of fleet) {
    if (ship.kind === EntityKind.DroneShip && ship.fleetIndex != null) {
      const col = ship.fleetIndex;
      const dx = (col - 0.5) * spacingX;
      ship.bounds.x = leader.bounds.x + leader.bounds.width / 2 - ship.bounds.width / 2 + dx;
      ship.bounds.y = leader.bounds.y + leader.bounds.height + offsetY;
      ship.bounds.x = Math.max(0, Math.min(gameWidth - ship.bounds.width, ship.bounds.x));
      ship.bounds.y = Math.max(0, Math.min(gameHeight - ship.bounds.height, ship.bounds.y));
    }
    idx++;
  }
}

export function getFleetShips(fleet: Entity[]): Entity[] {
  return fleet.filter(
    (e) => e.kind === EntityKind.PlayerShip || e.kind === EntityKind.DroneShip
  );
}
