import { BuiltInAiService } from './built-in-ai.service';
import { PinyinSession } from './built-in-ai.types';

describe('BuiltInAiService — detection', () => {
  let service: BuiltInAiService;

  afterEach(() => {
    (globalThis as any).LanguageModel = undefined;
    (globalThis as any).LanguageDetector = undefined;
  });

  beforeEach(() => {
    service = new BuiltInAiService();
  });

  it('isPromptApiAvailable reflects the global', () => {
    (globalThis as any).LanguageModel = undefined;
    expect(service.isPromptApiAvailable()).toBe(false);
    (globalThis as any).LanguageModel = { availability: jest.fn(), create: jest.fn() };
    expect(service.isPromptApiAvailable()).toBe(true);
  });

  it('isDetectorAvailable reflects the global', () => {
    (globalThis as any).LanguageDetector = undefined;
    expect(service.isDetectorAvailable()).toBe(false);
    (globalThis as any).LanguageDetector = { availability: jest.fn(), create: jest.fn() };
    expect(service.isDetectorAvailable()).toBe(true);
  });

  it('detectLanguage returns the top result mapped to {lang, confidence}', async () => {
    const detect = jest.fn().mockResolvedValue([
      { detectedLanguage: 'zh', confidence: 0.92 },
      { detectedLanguage: 'en', confidence: 0.05 }
    ]);
    (globalThis as any).LanguageDetector = { create: jest.fn().mockResolvedValue({ detect }) };
    const result = await service.detectLanguage('你好');
    expect(result).toEqual({ lang: 'zh', confidence: 0.92 });
  });

  it('detectLanguage returns null when the detector is unavailable', async () => {
    (globalThis as any).LanguageDetector = undefined;
    expect(await service.detectLanguage('你好')).toBeNull();
  });

  it('detectLanguage returns null when detection throws', async () => {
    (globalThis as any).LanguageDetector = {
      create: jest.fn().mockRejectedValue(new Error('boom'))
    };
    expect(await service.detectLanguage('你好')).toBeNull();
  });
});

describe('BuiltInAiService — pinyin', () => {
  let service: BuiltInAiService;
  afterEach(() => { (globalThis as any).LanguageModel = undefined; });
  beforeEach(() => { service = new BuiltInAiService(); });

  const fakeSession = (output: string): PinyinSession => ({
    prompt: jest.fn().mockResolvedValue(output),
    destroy: jest.fn()
  });

  it('createPinyinSession passes the system prompt and reports download progress', async () => {
    const create = jest.fn().mockImplementation((opts) => {
      opts.monitor?.({ addEventListener: (_t: string, cb: (e: { loaded: number }) => void) => cb({ loaded: 0.5 }) });
      return Promise.resolve(fakeSession('[]'));
    });
    (globalThis as any).LanguageModel = { create };
    const onDownloadProgress = jest.fn();
    await service.createPinyinSession({ onDownloadProgress });
    const passed = create.mock.calls[0][0];
    expect(passed.initialPrompts[0]).toEqual({ role: 'system', content: expect.stringContaining('Pinyin') });
    expect(onDownloadProgress).toHaveBeenCalledWith(0.5);
  });

  it('promptPinyinBatch parses a clean JSON array', async () => {
    const session = fakeSession('["nǐ hǎo", "zài jiàn"]');
    const result = await service.promptPinyinBatch(session, ['你好', '再见']);
    expect(result).toEqual(['nǐ hǎo', 'zài jiàn']);
  });

  it('promptPinyinBatch extracts a JSON array embedded in prose (regex fallback)', async () => {
    const session = fakeSession('Sure! Here you go:\n["nǐ hǎo", "zài jiàn"]\nHope that helps.');
    const result = await service.promptPinyinBatch(session, ['你好', '再见']);
    expect(result).toEqual(['nǐ hǎo', 'zài jiàn']);
  });

  it('promptPinyinBatch throws when the parsed length does not match the input', async () => {
    const session = fakeSession('["nǐ hǎo"]');
    await expect(service.promptPinyinBatch(session, ['你好', '再见'])).rejects.toThrow();
  });

  it('promptPinyinBatch throws when no array can be parsed', async () => {
    const session = fakeSession('I cannot do that.');
    await expect(service.promptPinyinBatch(session, ['你好'])).rejects.toThrow();
  });
});
