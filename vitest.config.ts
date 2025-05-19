import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,            // чтобы использовать describe, it без импорта
    environment: 'node',      // Node.js среда
    coverage: {
      provider: 'v8',         // покрытие кода
      reporter: ['text', 'lcov'],
    },
    deps: {
        interopDefault: true,
      }
  },
});
