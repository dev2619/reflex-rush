/**
 * TDD: Projectile pool — acquire, release, getActive. Pool is per-instance.
 */

import { createProjectilePool } from '../../src/entities/Projectile';
import { EntityKind } from '../../src/core/types';
import type { Bounds } from '../../src/core/types';

const W = 400;
const H = 800;
const from: Bounds = { x: 100, y: 500, width: 20, height: 15 };

describe('Projectile pool', () => {
  it('acquire returns projectile with correct kind and ownerId', () => {
    const pool = createProjectilePool();
    const p = pool.acquire('ship-1', from, 1, W, H);
    expect(p).not.toBeNull();
    expect(p!.kind).toBe(EntityKind.Projectile);
    expect(p!.ownerId).toBe('ship-1');
    expect(p!.damage).toBe(1);
  });

  it('acquire positions projectile at from center top', () => {
    const pool = createProjectilePool();
    const p = pool.acquire('ship-1', from, 1, W, H);
    expect(p!.bounds.x).toBe(from.x + from.width / 2 - p!.bounds.width / 2);
    expect(p!.bounds.y).toBe(from.y);
    expect(p!.bounds.width).toBeGreaterThan(0);
    expect(p!.bounds.height).toBeGreaterThan(0);
  });

  it('getActive returns only acquired and not released projectiles', () => {
    const pool = createProjectilePool();
    expect(pool.getActive()).toHaveLength(0);
    const p1 = pool.acquire('ship-1', from, 1, W, H);
    const p2 = pool.acquire('ship-1', from, 1, W, H);
    expect(pool.getActive()).toHaveLength(2);
    pool.release(p1!.id);
    expect(pool.getActive()).toHaveLength(1);
    expect(pool.getActive()[0].id).toBe(p2!.id);
    pool.release(p2!.id);
    expect(pool.getActive()).toHaveLength(0);
  });

  it('release is idempotent for unknown id', () => {
    const pool = createProjectilePool();
    pool.release('unknown-id');
    expect(pool.getActive()).toHaveLength(0);
  });

  it('released projectile can be acquired again (reuse)', () => {
    const pool = createProjectilePool();
    const p1 = pool.acquire('ship-1', from, 1, W, H);
    const id1 = p1!.id;
    pool.release(id1);
    const p2 = pool.acquire('ship-2', from, 2, W, H);
    expect(p2!.id).toBe(id1);
    expect(p2!.ownerId).toBe('ship-2');
    expect(p2!.damage).toBe(2);
  });
});
