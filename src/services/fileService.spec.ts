import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fileService } from './fileService';

describe('fileService.saveFile', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a download anchor and triggers it with the given filename', () => {
    const anchor = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor as unknown as HTMLElement);

    fileService.saveFile({ version: 7, students: [], camps: [], registrations: [], schedule: null }, 'test.json');

    expect(anchor.download).toBe('test.json');
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});

describe('fileService.openFile', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves with parsed JSON when a valid file is selected', async () => {
    const mockInput: Record<string, unknown> = { click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(mockInput as unknown as HTMLInputElement);

    const openPromise = fileService.openFile();
    const json = JSON.stringify({
      version: 7,
      students: [],
      camps: [],
      registrations: [],
      schedule: null,
    });
    const file = new File([json], 'test.json', { type: 'application/json' });
    (mockInput.onchange as (e: unknown) => void)({ target: { files: [file] } });

    const result = await openPromise;
    expect(result).toEqual({
      version: 7,
      students: [],
      camps: [],
      registrations: [],
      schedule: null,
    });
  });

  it('resolves with null when no file is selected', async () => {
    const mockInput: Record<string, unknown> = { click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(mockInput as unknown as HTMLInputElement);

    const openPromise = fileService.openFile();
    (mockInput.onchange as (e: unknown) => void)({ target: { files: [] } });

    expect(await openPromise).toBeNull();
  });

  it('resolves with null when the file contains invalid JSON', async () => {
    const mockInput: Record<string, unknown> = { click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(mockInput as unknown as HTMLInputElement);

    const openPromise = fileService.openFile();
    const file = new File(['not valid json {{{'], 'bad.json');
    (mockInput.onchange as (e: unknown) => void)({ target: { files: [file] } });

    expect(await openPromise).toBeNull();
  });
});
