import { BuiltInAiService } from './built-in-ai.service';
import { AnnotationSession } from './built-in-ai.types';

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

  it('detectLanguage returns null when detector creation throws', async () => {
    (globalThis as any).LanguageDetector = {
      create: jest.fn().mockRejectedValue(new Error('boom'))
    };
    expect(await service.detectLanguage('你好')).toBeNull();
  });

  it('detectLanguage reuses one detector across calls', async () => {
    const detect = jest.fn().mockResolvedValue([{ detectedLanguage: 'zh', confidence: 0.9 }]);
    const create = jest.fn().mockResolvedValue({ detect });
    (globalThis as any).LanguageDetector = { create };
    await service.detectLanguage('你好');
    await service.detectLanguage('再见');
    expect(create).toHaveBeenCalledTimes(1);
    expect(detect).toHaveBeenCalledTimes(2);
  });

  it('detectLanguage retries detector creation after a failure', async () => {
    const detect = jest.fn().mockResolvedValue([{ detectedLanguage: 'zh', confidence: 0.9 }]);
    const create = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue({ detect });
    (globalThis as any).LanguageDetector = { create };
    expect(await service.detectLanguage('你好')).toBeNull();
    expect(await service.detectLanguage('你好')).toEqual({ lang: 'zh', confidence: 0.9 });
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('detectLanguage keeps the cached detector when detect() fails', async () => {
    const detect = jest
      .fn()
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValue([{ detectedLanguage: 'zh', confidence: 0.9 }]);
    const create = jest.fn().mockResolvedValue({ detect });
    (globalThis as any).LanguageDetector = { create };
    expect(await service.detectLanguage('你好')).toBeNull();
    expect(await service.detectLanguage('再见')).toEqual({ lang: 'zh', confidence: 0.9 });
    expect(create).toHaveBeenCalledTimes(1);
    expect(detect).toHaveBeenCalledTimes(2);
  });
});

describe('BuiltInAiService — generic annotation API', () => {
  let service: BuiltInAiService;
  afterEach(() => {
    (globalThis as any).LanguageModel = undefined;
  });
  beforeEach(() => {
    service = new BuiltInAiService();
  });

  const fakeSession = (output: string): AnnotationSession => ({
    prompt: jest.fn().mockResolvedValue(output),
    clone: jest.fn(),
    destroy: jest.fn()
  });

  const fakeCloneableSession = (output: string) => {
    const clone = {
      prompt: jest.fn().mockResolvedValue(output),
      destroy: jest.fn(),
      clone: jest.fn()
    };
    const base = {
      prompt: jest.fn(),
      destroy: jest.fn(),
      clone: jest.fn().mockResolvedValue(clone)
    };
    return { base, clone };
  };

  it('concurrent ensureReady calls share a single session creation', async () => {
    const { base } = fakeCloneableSession('[]');
    let resolveCreate!: (s: unknown) => void;
    const create = jest.fn().mockReturnValue(new Promise((r) => (resolveCreate = r)));
    (globalThis as any).LanguageModel = { create };
    const engine = service.getPromptEngine({ id: 't-conc', systemPrompt: 'S', batchInstruction: 'I' });
    const first = engine.ensureReady();
    const second = engine.ensureReady();
    resolveCreate(base);
    await Promise.all([first, second]);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('a failed session creation is retried by the next ensureReady', async () => {
    const { base } = fakeCloneableSession('[]');
    const create = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue(base);
    (globalThis as any).LanguageModel = { create };
    const engine = service.getPromptEngine({ id: 't-retry', systemPrompt: 'S', batchInstruction: 'I' });
    await expect(engine.ensureReady()).rejects.toThrow('boom');
    await engine.ensureReady();
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('annotateBatch prompts a clone and destroys it, never the base session', async () => {
    const { base, clone } = fakeCloneableSession('["nǐ hǎo"]');
    (globalThis as any).LanguageModel = { create: jest.fn().mockResolvedValue(base) };
    const engine = service.getPromptEngine({ id: 't-clone', systemPrompt: 'S', batchInstruction: 'I' });
    await engine.ensureReady();
    const result = await engine.annotateBatch(['你好']);
    expect(result).toEqual(['nǐ hǎo']);
    expect(base.clone).toHaveBeenCalled();
    expect((clone.prompt as jest.Mock).mock.calls[0][0]).toBe('I\n\n你好');
    expect(base.prompt).not.toHaveBeenCalled();
    expect(clone.destroy).toHaveBeenCalled();
    expect(base.destroy).not.toHaveBeenCalled();
  });

  it('annotateBatch destroys the clone even when the prompt fails', async () => {
    const { base, clone } = fakeCloneableSession('[]');
    (clone.prompt as jest.Mock).mockRejectedValue(new Error('AI error'));
    (globalThis as any).LanguageModel = { create: jest.fn().mockResolvedValue(base) };
    const engine = service.getPromptEngine({ id: 't-cfail', systemPrompt: 'S', batchInstruction: 'I' });
    await engine.ensureReady();
    await expect(engine.annotateBatch(['你好'])).rejects.toThrow('AI error');
    expect(clone.destroy).toHaveBeenCalled();
  });

  it('destroy invalidates stale in-flight creations so late settlement does not leak', async () => {
    const s1 = {
      prompt: jest.fn(),
      destroy: jest.fn(),
      clone: jest.fn()
    };
    const s2Clone = {
      prompt: jest.fn().mockResolvedValue('["result"]'),
      destroy: jest.fn(),
      clone: jest.fn()
    };
    const s2 = {
      prompt: jest.fn(),
      destroy: jest.fn(),
      clone: jest.fn().mockResolvedValue(s2Clone)
    };
    let resolveCreate!: (s: unknown) => void;
    const create = jest
      .fn()
      .mockReturnValueOnce(new Promise((r) => (resolveCreate = r)))
      .mockResolvedValueOnce(s2);
    (globalThis as any).LanguageModel = { create };
    const engine = service.getPromptEngine({ id: 't-epoch', systemPrompt: 'S', batchInstruction: 'I' });
    // Start first ensureReady, which starts creating
    const firstReady = engine.ensureReady();
    // Destroy immediately (increments epoch)
    engine.destroy();
    // Start second ensureReady, which creates a new session
    await engine.ensureReady();
    // Resolve the first create late with s1
    resolveCreate(s1);
    // Let the first promise settle (it should reject or complete without adopting s1)
    await expect(firstReady).resolves.toBeUndefined();
    // Verify s1 was destroyed by the late settlement, not adopted
    expect(s1.destroy).toHaveBeenCalled();
    // Verify subsequent annotateBatch uses s2, not s1
    const result = await engine.annotateBatch(['test']);
    expect(result).toEqual(['result']);
    expect(s2.clone).toHaveBeenCalled();
    expect(s2Clone.prompt).toHaveBeenCalled();
    // s1 should never have been cloned or prompted
    expect(s1.clone).not.toHaveBeenCalled();
    expect(s1.prompt).not.toHaveBeenCalled();
  });

  it('checkAvailability returns unavailable when the global is missing', async () => {
    (globalThis as any).LanguageModel = undefined;
    expect(await service.checkAvailability()).toBe('unavailable');
  });

  it('checkAvailability returns LanguageModel.availability', async () => {
    const availability = jest.fn().mockResolvedValue('available');
    (globalThis as any).LanguageModel = { availability, create: jest.fn() };
    expect(await service.checkAvailability()).toBe('available');
  });

  it('checkAvailability returns unavailable when availability throws', async () => {
    (globalThis as any).LanguageModel = {
      availability: jest.fn().mockRejectedValue(new Error('boom')),
      create: jest.fn()
    };
    expect(await service.checkAvailability()).toBe('unavailable');
  });

  it('createSession passes the given system prompt', async () => {
    const create = jest.fn().mockResolvedValue(fakeSession('[]'));
    (globalThis as any).LanguageModel = { create };
    await service.createSession('You are a romaji transliterator.');
    expect(create.mock.calls[0][0].initialPrompts[0]).toEqual({
      role: 'system',
      content: 'You are a romaji transliterator.'
    });
  });

  it('promptBatch prefixes the instruction and parses the JSON array', async () => {
    const session = fakeSession('["ki mi", "no na"]');
    const result = await service.promptBatch(session, 'Convert to romaji.', ['君', 'の名']);
    expect(result).toEqual(['ki mi', 'no na']);
    expect((session.prompt as jest.Mock).mock.calls[0][0]).toBe('Convert to romaji.\n\n君\nの名');
  });

  it('promptBatch throws on length mismatch', async () => {
    const session = fakeSession('["one"]');
    await expect(service.promptBatch(session, 'x', ['a', 'b'])).rejects.toThrow();
  });

  it('getPromptEngine creates the session once across ensureReady calls and prompts with the spec', async () => {
    const { base, clone } = fakeCloneableSession('["kimi no"]');
    const create = jest.fn().mockResolvedValue(base);
    (globalThis as any).LanguageModel = { create };
    const engine = service.getPromptEngine({ id: 't-once', systemPrompt: 'SYS', batchInstruction: 'INSTR' });
    await engine.ensureReady();
    await engine.ensureReady();
    expect(create).toHaveBeenCalledTimes(1);
    const result = await engine.annotateBatch(['君の']);
    expect(result).toEqual(['kimi no']);
    expect((clone.prompt as jest.Mock).mock.calls[0][0]).toBe('INSTR\n\n君の');
  });

  it('getPromptEngine.destroy destroys the session and allows a fresh one', async () => {
    const { base } = fakeCloneableSession('[]');
    const create = jest.fn().mockResolvedValue(base);
    (globalThis as any).LanguageModel = { create };
    const engine = service.getPromptEngine({ id: 't-destroy', systemPrompt: 'SYS', batchInstruction: 'I' });
    await engine.ensureReady();
    engine.destroy();
    expect(base.destroy).toHaveBeenCalled();
    await engine.ensureReady();
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('getPromptEngine.annotateBatch rejects when ensureReady has not run', async () => {
    (globalThis as any).LanguageModel = { create: jest.fn() };
    const engine = service.getPromptEngine({ id: 't-notready', systemPrompt: 'SYS', batchInstruction: 'I' });
    await expect(engine.annotateBatch(['a'])).rejects.toThrow();
  });

  it('getPromptEngine returns the same engine for the same id and a new one per id', () => {
    (globalThis as any).LanguageModel = { create: jest.fn() };
    const a = service.getPromptEngine({ id: 'pinyin', systemPrompt: 'S', batchInstruction: 'I' });
    const b = service.getPromptEngine({ id: 'pinyin', systemPrompt: 'S', batchInstruction: 'I' });
    const c = service.getPromptEngine({ id: 'romaji', systemPrompt: 'S2', batchInstruction: 'I2' });
    expect(b).toBe(a);
    expect(c).not.toBe(a);
  });
});

describe('BuiltInAiService — translator engine', () => {
  let service: BuiltInAiService;
  afterEach(() => {
    (globalThis as any).Translator = undefined;
  });
  beforeEach(() => {
    service = new BuiltInAiService();
  });

  const SPEC = { id: 'vi-en', sourceLanguage: 'vi', targetLanguage: 'en' };

  const fakeTranslator = () => ({
    translate: jest.fn((input: string) => Promise.resolve(`en:${input}`)),
    destroy: jest.fn()
  });

  it('isTranslatorApiAvailable reflects the global', () => {
    (globalThis as any).Translator = undefined;
    expect(service.isTranslatorApiAvailable()).toBe(false);
    (globalThis as any).Translator = { availability: jest.fn(), create: jest.fn() };
    expect(service.isTranslatorApiAvailable()).toBe(true);
  });

  it('checkTranslatorAvailability returns unavailable when the global is missing', async () => {
    (globalThis as any).Translator = undefined;
    expect(await service.checkTranslatorAvailability('vi', 'en')).toBe('unavailable');
  });

  it('checkTranslatorAvailability passes the language pair through', async () => {
    const availability = jest.fn().mockResolvedValue('available');
    (globalThis as any).Translator = { availability, create: jest.fn() };
    expect(await service.checkTranslatorAvailability('vi', 'en')).toBe('available');
    expect(availability).toHaveBeenCalledWith({ sourceLanguage: 'vi', targetLanguage: 'en' });
  });

  it('checkTranslatorAvailability returns unavailable when availability throws', async () => {
    (globalThis as any).Translator = {
      availability: jest.fn().mockRejectedValue(new Error('boom')),
      create: jest.fn()
    };
    expect(await service.checkTranslatorAvailability('vi', 'en')).toBe('unavailable');
  });

  it('creates the translator once across ensureReady calls with the spec pair', async () => {
    const translator = fakeTranslator();
    const create = jest.fn().mockResolvedValue(translator);
    (globalThis as any).Translator = { create };
    const engine = service.getTranslatorEngine(SPEC);
    await engine.ensureReady();
    await engine.ensureReady();
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toMatchObject({ sourceLanguage: 'vi', targetLanguage: 'en' });
  });

  it('annotateBatch translates each line in order on the cached translator', async () => {
    const translator = fakeTranslator();
    (globalThis as any).Translator = { create: jest.fn().mockResolvedValue(translator) };
    const engine = service.getTranslatorEngine(SPEC);
    await engine.ensureReady();
    const result = await engine.annotateBatch(['Anh vẫn yêu em', 'Đừng quên']);
    expect(result).toEqual(['en:Anh vẫn yêu em', 'en:Đừng quên']);
    expect(translator.translate).toHaveBeenCalledTimes(2);
    expect(translator.destroy).not.toHaveBeenCalled();
  });

  it('annotateBatch rejects when ensureReady has not run', async () => {
    (globalThis as any).Translator = { create: jest.fn() };
    const engine = service.getTranslatorEngine(SPEC);
    await expect(engine.annotateBatch(['a'])).rejects.toThrow();
  });

  it('concurrent ensureReady calls share a single translator creation', async () => {
    const translator = fakeTranslator();
    let resolveCreate!: (t: unknown) => void;
    const create = jest.fn().mockReturnValue(new Promise((r) => (resolveCreate = r)));
    (globalThis as any).Translator = { create };
    const engine = service.getTranslatorEngine({ ...SPEC, id: 'vi-en-conc' });
    const first = engine.ensureReady();
    const second = engine.ensureReady();
    resolveCreate(translator);
    await Promise.all([first, second]);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('a failed translator creation is retried by the next ensureReady', async () => {
    const translator = fakeTranslator();
    const create = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue(translator);
    (globalThis as any).Translator = { create };
    const engine = service.getTranslatorEngine({ ...SPEC, id: 'vi-en-retry' });
    await expect(engine.ensureReady()).rejects.toThrow('boom');
    await engine.ensureReady();
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('destroy invalidates stale in-flight creations so late settlement does not leak', async () => {
    const t1 = fakeTranslator();
    const t2 = fakeTranslator();
    let resolveCreate!: (t: unknown) => void;
    const create = jest
      .fn()
      .mockReturnValueOnce(new Promise((r) => (resolveCreate = r)))
      .mockResolvedValueOnce(t2);
    (globalThis as any).Translator = { create };
    const engine = service.getTranslatorEngine({ ...SPEC, id: 'vi-en-epoch' });
    const firstReady = engine.ensureReady();
    engine.destroy();
    await engine.ensureReady();
    resolveCreate(t1);
    await expect(firstReady).resolves.toBeUndefined();
    expect(t1.destroy).toHaveBeenCalled();
    const result = await engine.annotateBatch(['xin chào']);
    expect(result).toEqual(['en:xin chào']);
    expect(t2.translate).toHaveBeenCalled();
    expect(t1.translate).not.toHaveBeenCalled();
  });

  it('getTranslatorEngine returns the same engine for the same id', () => {
    (globalThis as any).Translator = { create: jest.fn() };
    const a = service.getTranslatorEngine(SPEC);
    const b = service.getTranslatorEngine(SPEC);
    expect(b).toBe(a);
  });
});
