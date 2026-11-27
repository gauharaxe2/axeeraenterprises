import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  THEME_STORAGE_KEY,
  getNextTheme,
  isThemeMode,
  resolveInitialTheme
} from './theme.ts';

describe('theme utilities', () => {
  it('validates supported theme modes strictly', () => {
    assert.equal(isThemeMode('light'), true);
    assert.equal(isThemeMode('dark'), true);
    assert.equal(isThemeMode('system'), false);
    assert.equal(isThemeMode(null), false);
    assert.equal(isThemeMode(undefined), false);
  });

  it('prefers valid savedTheme over OS preference and defaults to light', () => {
    assert.equal(resolveInitialTheme({ savedTheme: 'dark', prefersDark: false }), 'dark');
    assert.equal(resolveInitialTheme({ savedTheme: 'light', prefersDark: true }), 'light');
    assert.equal(resolveInitialTheme({ savedTheme: 'invalid', prefersDark: true }), 'dark');
    assert.equal(resolveInitialTheme({ savedTheme: null, prefersDark: false }), 'light');
    assert.equal(resolveInitialTheme(), 'light');
  });

  it('toggles cleanly between light and dark', () => {
    assert.equal(getNextTheme('light'), 'dark');
    assert.equal(getNextTheme('dark'), 'light');
    assert.equal(THEME_STORAGE_KEY, 'axes_era_theme');
  });
});
