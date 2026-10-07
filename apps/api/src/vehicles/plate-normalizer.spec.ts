import { normalizePlateNumber } from './plate-normalizer';

describe('normalizePlateNumber', () => {
  it('trims and collapses whitespace while preserving readable plate formatting', () => {
    expect(normalizePlateNumber('  aa   123  ')).toBe('AA 123');
  });
});
