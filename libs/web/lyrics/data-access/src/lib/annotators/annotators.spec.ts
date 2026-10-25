import { ANNOTATORS, findAnnotatorForLanguage, getAnnotatorById } from './index';
import { PINYIN_ANNOTATOR } from './pinyin.annotator';
import { ROMAJI_ANNOTATOR } from './romaji.annotator';
import { VI_EN_ANNOTATOR } from './vi-en.annotator';

describe('annotator registry', () => {
  it('registers pinyin, romaji, and vi-en', () => {
    expect(ANNOTATORS).toEqual([PINYIN_ANNOTATOR, ROMAJI_ANNOTATOR, VI_EN_ANNOTATOR]);
  });

  it('picks pinyin for zh variants', () => {
    expect(findAnnotatorForLanguage('zh')).toBe(PINYIN_ANNOTATOR);
    expect(findAnnotatorForLanguage('zh-Hant')).toBe(PINYIN_ANNOTATOR);
  });

  it('picks romaji for ja', () => {
    expect(findAnnotatorForLanguage('ja')).toBe(ROMAJI_ANNOTATOR);
  });

  it('picks vi-en for vi', () => {
    expect(findAnnotatorForLanguage('vi')).toBe(VI_EN_ANNOTATOR);
  });

  it('returns null for languages with no annotator', () => {
    expect(findAnnotatorForLanguage('en')).toBeNull();
    expect(findAnnotatorForLanguage('ko')).toBeNull();
  });

  it('looks up annotators by id', () => {
    expect(getAnnotatorById('pinyin')).toBe(PINYIN_ANNOTATOR);
    expect(getAnnotatorById('romaji')).toBe(ROMAJI_ANNOTATOR);
    expect(getAnnotatorById('vi-en')).toBe(VI_EN_ANNOTATOR);
    expect(getAnnotatorById('nope')).toBeNull();
  });
});

describe('pinyin annotator config', () => {
  it('qualifies Han lines only', () => {
    expect(PINYIN_ANNOTATOR.lineQualifies('你好')).toBe(true);
    expect(PINYIN_ANNOTATOR.lineQualifies('instrumental break')).toBe(false);
  });

  it('keeps the shipped prompts and toggle copy', () => {
    expect(PINYIN_ANNOTATOR.systemPrompt).toContain('Hanyu-Pinyin');
    expect(PINYIN_ANNOTATOR.batchInstruction).toContain('JSON array');
    expect(PINYIN_ANNOTATOR.toggle.icon).toBe('拼');
    expect(PINYIN_ANNOTATOR.toggle.preparingLabel).toBe('Preparing pinyin…');
  });
});

describe('romaji annotator config', () => {
  it('qualifies kana-only, kanji-only and mixed lines; skips Latin/symbols', () => {
    expect(ROMAJI_ANNOTATOR.lineQualifies('ありがとう')).toBe(true);
    expect(ROMAJI_ANNOTATOR.lineQualifies('愛')).toBe(true);
    expect(ROMAJI_ANNOTATOR.lineQualifies('君の名前')).toBe(true);
    expect(ROMAJI_ANNOTATOR.lineQualifies('Instrumental')).toBe(false);
    expect(ROMAJI_ANNOTATOR.lineQualifies('♪')).toBe(false);
  });

  it('declares Hepburn romaji prompts and toggle copy', () => {
    expect(ROMAJI_ANNOTATOR.systemPrompt).toContain('Hepburn');
    expect(ROMAJI_ANNOTATOR.batchInstruction).toContain('JSON array');
    expect(ROMAJI_ANNOTATOR.toggle.icon).toBe('あ');
    expect(ROMAJI_ANNOTATOR.toggle.preparingLabel).toBe('Preparing romaji…');
  });
});

describe('vi-en annotator config', () => {
  it('qualifies any lettered line; skips decoration-only lines', () => {
    expect(VI_EN_ANNOTATOR.lineQualifies('Anh vẫn yêu em')).toBe(true);
    expect(VI_EN_ANNOTATOR.lineQualifies('Đừng quên')).toBe(true);
    expect(VI_EN_ANNOTATOR.lineQualifies('♪')).toBe(false);
    expect(VI_EN_ANNOTATOR.lineQualifies('...')).toBe(false);
  });

  it('declares the translator pair and toggle copy', () => {
    expect(VI_EN_ANNOTATOR.kind).toBe('translator');
    expect(VI_EN_ANNOTATOR.sourceLanguage).toBe('vi');
    expect(VI_EN_ANNOTATOR.targetLanguage).toBe('en');
    expect(VI_EN_ANNOTATOR.toggle.icon).toBe('EN');
    expect(VI_EN_ANNOTATOR.toggle.preparingLabel).toBe('Preparing translation…');
  });
});
