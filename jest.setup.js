/** Jest setup — mocks globales para TDD */
// Mock expo-haptics (no disponible en Node)
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
}));

// Polyfill requestAnimationFrame para GameLoop en Node
global.requestAnimationFrame = global.requestAnimationFrame ?? ((cb) => setTimeout(() => cb(performance.now()), 16));
global.cancelAnimationFrame = global.cancelAnimationFrame ?? ((id) => clearTimeout(id));
