/**
 * TDD: GameLoop — subscribe recibe ticks, start/stop controlan el loop.
 */

import { createGameLoop } from '../../src/engine/GameLoop';

describe('GameLoop', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('is not running initially', () => {
    const loop = createGameLoop();
    expect(loop.isRunning()).toBe(false);
  });

  it('calls subscriber with delta on start', () => {
    const loop = createGameLoop();
    const tick = jest.fn();
    loop.subscribe(tick);
    loop.start();
    expect(loop.isRunning()).toBe(true);
    jest.advanceTimersByTime(20);
    expect(tick).toHaveBeenCalled();
    expect(typeof tick.mock.calls[0][0]).toBe('number');
    loop.stop();
  });

  it('stops calling after stop', () => {
    const loop = createGameLoop();
    const tick = jest.fn();
    loop.subscribe(tick);
    loop.start();
    const countBefore = tick.mock.calls.length;
    loop.stop();
    jest.advanceTimersByTime(100);
    expect(loop.isRunning()).toBe(false);
    expect(tick.mock.calls.length).toBe(countBefore);
  });

  it('unsubscribe removes callback', () => {
    const loop = createGameLoop();
    const tick = jest.fn();
    const unsub = loop.subscribe(tick);
    loop.start();
    tick.mockClear();
    unsub();
    jest.advanceTimersByTime(50);
    expect(tick).not.toHaveBeenCalled();
    loop.stop();
  });
});
