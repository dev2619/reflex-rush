/**
 * TDD: InputSystem — resolveSwipe devuelve dirección correcta.
 */

import { createInputSystem } from '../../src/systems/InputSystem';

describe('InputSystem', () => {
  it('resolveSwipe returns null for small gesture', () => {
    const input = createInputSystem();
    expect(input.resolveSwipe(10, 0)).toBeNull();
    expect(input.resolveSwipe(0, 10)).toBeNull();
  });

  it('resolveSwipe returns left for strong horizontal left', () => {
    const input = createInputSystem();
    expect(input.resolveSwipe(-80, 0)).toBe('left');
    expect(input.resolveSwipe(-100, 10)).toBe('left');
  });

  it('resolveSwipe returns right for strong horizontal right', () => {
    const input = createInputSystem();
    expect(input.resolveSwipe(80, 0)).toBe('right');
  });

  it('resolveSwipe returns up for strong vertical up', () => {
    const input = createInputSystem();
    expect(input.resolveSwipe(0, -80)).toBe('up');
  });

  it('resolveSwipe returns down for strong vertical down', () => {
    const input = createInputSystem();
    expect(input.resolveSwipe(0, 80)).toBe('down');
  });
});
