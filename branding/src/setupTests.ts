import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock CSS.supports
Object.defineProperty(CSS, 'supports', {
  writable: true,
  value: jest.fn().mockReturnValue(true),
});

// Mock FontFace API
global.FontFace = jest.fn().mockImplementation(() => ({
  load: jest.fn().mockResolvedValue(undefined),
}));

Object.defineProperty(document, 'fonts', {
  writable: true,
  value: {
    add: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    check: jest.fn().mockReturnValue(true),
    load: jest.fn().mockResolvedValue([]),
    ready: Promise.resolve(),
  },
});

// Mock Element.animate
Element.prototype.animate = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  cancel: jest.fn(),
  finish: jest.fn(),
  pause: jest.fn(),
  play: jest.fn(),
  reverse: jest.fn(),
}));

// React 19 compatibility: Ensure document.body exists and has proper methods
beforeEach(() => {
  // Ensure document.body exists and has proper DOM methods
  if (!document.body) {
    const body = document.createElement('body');
    document.appendChild(body);
  }
  
  // Ensure document.body has proper methods
  if (!document.body.appendChild) {
    document.body.appendChild = jest.fn();
  }
  if (!document.body.removeChild) {
    document.body.removeChild = jest.fn();
  }
  
  // Ensure document.head exists and has proper methods
  if (!document.head) {
    const head = document.createElement('head');
    document.appendChild(head);
  }
  
  if (!document.head.appendChild) {
    document.head.appendChild = jest.fn();
  }
});

// Suppress console errors for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: createRoot') ||
       args[0].includes('Target container is not a DOM element') ||
       args[0].includes('Warning: ReactDOM.createRoot'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
