import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

describe('safeSetItem', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stores the value and returns true on success', async () => {
    vi.resetModules();
    const { safeSetItem } = await import('./safeStorage');
    expect(safeSetItem('my-key', 'hello')).toBe(true);
    expect(localStorage.getItem('my-key')).toBe('hello');
  });

  it('returns false and shows an alert when localStorage.setItem throws', async () => {
    vi.resetModules();
    const { safeSetItem } = await import('./safeStorage');
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(safeSetItem('key', 'value')).toBe(false);
    expect(alertSpy).toHaveBeenCalledOnce();
  });

  it('shows the quota alert only once across multiple consecutive failures', async () => {
    vi.resetModules();
    const { safeSetItem } = await import('./safeStorage');
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    safeSetItem('k1', 'v1');
    safeSetItem('k2', 'v2');
    expect(alertSpy).toHaveBeenCalledOnce();
  });
});
