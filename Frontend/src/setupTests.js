import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Polyfill for matchMedia (needed for react-slick)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener:vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Suppress unhandled promise rejections from axios mock
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Cannot read properties')) {
    event.preventDefault();
  }
});