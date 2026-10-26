import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
});

// jsdom no implementa scrollTo; la app lo usa al cambiar de vista.
window.scrollTo = () => {};
