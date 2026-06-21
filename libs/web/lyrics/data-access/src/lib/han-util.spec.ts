import { containsHan } from './han-util';

describe('containsHan', () => {
  it('returns true for simplified and traditional Han characters', () => {
    expect(containsHan('月亮代表我的心')).toBe(true);
    expect(containsHan('愛')).toBe(true);
  });

  it('returns false for non-Han text', () => {
    expect(containsHan('hello world')).toBe(false);
    expect(containsHan('')).toBe(false);
    expect(containsHan('123 !@#')).toBe(false);
  });

  it('returns true for mixed lines containing any Han', () => {
    expect(containsHan('La la 月亮')).toBe(true);
  });
});
