/**
 * Entity — minimal ECS-style entity (id + kind + bounds + optional data).
 */

import type { Bounds } from '../core/types';
import { EntityKind } from '../core/types';

export interface Entity {
  id: string;
  kind: EntityKind;
  bounds: Bounds;
  velocity?: { x: number; y: number };
  /** For threats: lane index 0..PLAYER_LANE_COUNT-1 */
  lane?: number;
  /** Optional: skin/trail id for rendering */
  skinId?: string;
  /** Optional: time-to-live for particles */
  ttlMs?: number;
  /** Threat variant: 0=normal, 1=fast, 2=wide (colores/formas en UI) */
  threatVariant?: number;
}

let nextId = 0;
export function nextEntityId(): string {
  return `e_${++nextId}`;
}

export function createEntity(
  kind: EntityKind,
  bounds: Bounds,
  opts: Partial<Pick<Entity, 'velocity' | 'lane' | 'skinId' | 'ttlMs' | 'threatVariant'>> = {}
): Entity {
  return {
    id: nextEntityId(),
    kind,
    bounds: { ...bounds },
    ...opts,
  };
}
