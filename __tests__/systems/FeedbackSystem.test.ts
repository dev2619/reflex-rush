/**
 * TDD: FeedbackSystem — trigger no lanza (haptics mockeado).
 */

import { createFeedbackSystem } from '../../src/systems/FeedbackSystem';

describe('FeedbackSystem', () => {
  it('trigger does not throw for any event', () => {
    const feedback = createFeedbackSystem();
    expect(() => feedback.trigger('swipe')).not.toThrow();
    expect(() => feedback.trigger('near_miss')).not.toThrow();
    expect(() => feedback.trigger('death')).not.toThrow();
    expect(() => feedback.trigger('retry')).not.toThrow();
    expect(() => feedback.trigger('revive')).not.toThrow();
    expect(() => feedback.trigger('score_tick')).not.toThrow();
  });
});
