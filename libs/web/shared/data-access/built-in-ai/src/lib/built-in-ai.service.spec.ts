import { BuiltInAiService } from './built-in-ai.service';

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
