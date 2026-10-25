import { Injectable } from '@angular/core';
import {
  AiAvailability,
  AnnotationEngine,
  AnnotationSession,
  CreateSessionOptions,
  DetectorInstance,
  LanguageDetectionResult,
  PromptEngineSpec,
  TranslatorEngineSpec,
  TranslatorInstance
} from './built-in-ai.types';

@Injectable({ providedIn: 'root' })
export class BuiltInAiService {
  /** One detector for the app's lifetime; cleared on failure so the next call retries. */
  private detector: Promise<DetectorInstance> | null = null;

  /** One engine (and base session) per annotator id, kept for the app's lifetime. */
  private engines = new Map<string, AnnotationEngine>();

  isPromptApiAvailable(): boolean {
    return typeof globalThis.LanguageModel !== 'undefined';
  }

  isDetectorAvailable(): boolean {
    return typeof globalThis.LanguageDetector !== 'undefined';
  }

  isTranslatorApiAvailable(): boolean {
    return typeof globalThis.Translator !== 'undefined';
  }

  async checkTranslatorAvailability(
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<AiAvailability> {
    if (!globalThis.Translator) {
      return 'unavailable';
    }
    try {
      return await globalThis.Translator.availability({ sourceLanguage, targetLanguage });
    } catch {
      return 'unavailable';
    }
  }

  async checkAvailability(): Promise<AiAvailability> {
    if (!globalThis.LanguageModel) {
      return 'unavailable';
    }
    try {
      return await globalThis.LanguageModel.availability();
    } catch {
      return 'unavailable';
    }
  }

  async detectLanguage(text: string): Promise<LanguageDetectionResult | null> {
    if (!this.isDetectorAvailable()) {
      return null;
    }
    const t0 = performance.now();
    let detector: DetectorInstance;
    try {
      if (!this.detector) {
        this.detector = globalThis.LanguageDetector!.create();
      }
      detector = await this.detector;
    } catch {
      this.detector = null;
      return null;
    }
    try {
      const results = await detector.detect(text);
      console.log(`[BuiltInAI] detectLanguage: ${(performance.now() - t0).toFixed(1)}ms`);
      const top = results[0];
      return top ? { lang: top.detectedLanguage, confidence: top.confidence } : null;
    } catch {
      return null;
    }
  }

  async createSession(
    systemPrompt: string,
    opts: CreateSessionOptions = {}
  ): Promise<AnnotationSession> {
    if (!this.isPromptApiAvailable()) {
      throw new Error('Prompt API unavailable');
    }
    const t0 = performance.now();
    const session = await globalThis.LanguageModel!.create({
      initialPrompts: [{ role: 'system', content: systemPrompt }],
      signal: opts.signal,
      monitor: (m) =>
        m.addEventListener('downloadprogress', (e) => opts.onDownloadProgress?.(e.loaded))
    });
    console.log(`[BuiltInAI] createSession: ${(performance.now() - t0).toFixed(1)}ms`);
    return session;
  }

  async promptBatch(
    session: AnnotationSession,
    instruction: string,
    lines: string[],
    signal?: AbortSignal
  ): Promise<string[]> {
    const prompt = `${instruction}\n\n${lines.join('\n')}`;
    const t0 = performance.now();
    const raw = await session.prompt(prompt, { signal });
    console.log(`[BuiltInAI] promptBatch ← ${(performance.now() - t0).toFixed(1)}ms for ${lines.length} lines`);
    const parsed = this.parseArray(raw);
    if (!parsed || parsed.length !== lines.length) {
      throw new Error(`Batch parse failed: expected ${lines.length} lines`);
    }
    return parsed;
  }

  /**
   * The Prompt API engine for one annotator. Cached by spec.id: the base
   * session survives track changes, so the second song in the same language
   * starts warm.
   */
  getPromptEngine(spec: PromptEngineSpec): AnnotationEngine {
    let engine = this.engines.get(spec.id);
    if (!engine) {
      engine = this.buildPromptEngine(spec);
      this.engines.set(spec.id, engine);
    }
    return engine;
  }

  private buildPromptEngine(spec: PromptEngineSpec): AnnotationEngine {
    let session: AnnotationSession | null = null;
    let creating: Promise<void> | null = null;
    let epoch = 0;
    return {
      // Memoizes the in-flight creation: the detectAndSeed warm-up and the
      // first drain both land here and share one LanguageModel.create().
      ensureReady: (opts: CreateSessionOptions = {}) => {
        if (session) {
          return Promise.resolve();
        }
        if (!creating) {
          const started = epoch;
          creating = this.createSession(spec.systemPrompt, opts).then(
            (s) => {
              if (started !== epoch) {
                s.destroy(); // destroy() superseded this creation — don't adopt, don't leak
                return;
              }
              session = s;
              creating = null;
            },
            (err) => {
              if (started === epoch) {
                creating = null;
              }
              throw err;
            }
          );
        }
        return creating;
      },
      // Each batch runs on a throwaway clone so the base session keeps only
      // the system prompt — batches never accumulate as context.
      annotateBatch: async (lines: string[], signal?: AbortSignal) => {
        if (!session) {
          throw new Error('Annotation engine not ready');
        }
        const clone = await session.clone({ signal });
        try {
          return await this.promptBatch(clone, spec.batchInstruction, lines, signal);
        } finally {
          clone.destroy();
        }
      },
      destroy: () => {
        epoch++;
        session?.destroy();
        session = null;
        creating = null;
      }
    };
  }

  /**
   * The Translator API engine for one annotator. Cached by spec.id like the
   * prompt engines: the translator survives track changes, so the second song
   * in the same language starts warm.
   */
  getTranslatorEngine(spec: TranslatorEngineSpec): AnnotationEngine {
    let engine = this.engines.get(spec.id);
    if (!engine) {
      engine = this.buildTranslatorEngine(spec);
      this.engines.set(spec.id, engine);
    }
    return engine;
  }

  private async createTranslator(
    spec: TranslatorEngineSpec,
    opts: CreateSessionOptions = {}
  ): Promise<TranslatorInstance> {
    if (!this.isTranslatorApiAvailable()) {
      throw new Error('Translator API unavailable');
    }
    const t0 = performance.now();
    const translator = await globalThis.Translator!.create({
      sourceLanguage: spec.sourceLanguage,
      targetLanguage: spec.targetLanguage,
      signal: opts.signal,
      monitor: (m) =>
        m.addEventListener('downloadprogress', (e) => opts.onDownloadProgress?.(e.loaded))
    });
    console.log(`[BuiltInAI] createTranslator: ${(performance.now() - t0).toFixed(1)}ms`);
    return translator;
  }

  private buildTranslatorEngine(spec: TranslatorEngineSpec): AnnotationEngine {
    let translator: TranslatorInstance | null = null;
    let creating: Promise<void> | null = null;
    let epoch = 0;
    return {
      // Same memoization as the prompt engine: warm-up and first drain share
      // one Translator.create().
      ensureReady: (opts: CreateSessionOptions = {}) => {
        if (translator) {
          return Promise.resolve();
        }
        if (!creating) {
          const started = epoch;
          creating = this.createTranslator(spec, opts).then(
            (t) => {
              if (started !== epoch) {
                t.destroy(); // destroy() superseded this creation — don't adopt, don't leak
                return;
              }
              translator = t;
              creating = null;
            },
            (err) => {
              if (started === epoch) {
                creating = null;
              }
              throw err;
            }
          );
        }
        return creating;
      },
      // Translators carry no conversation state, so batches run directly on
      // the cached instance — no clone dance needed.
      annotateBatch: async (lines: string[], signal?: AbortSignal) => {
        if (!translator) {
          throw new Error('Annotation engine not ready');
        }
        const t0 = performance.now();
        const results: string[] = [];
        for (const line of lines) {
          results.push(await translator.translate(line, { signal }));
        }
        console.log(
          `[BuiltInAI] translateBatch ← ${(performance.now() - t0).toFixed(1)}ms for ${lines.length} lines`
        );
        return results;
      },
      destroy: () => {
        epoch++;
        translator?.destroy();
        translator = null;
        creating = null;
      }
    };
  }

  private parseArray(raw: string): string[] | null {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      return null;
    }
    try {
      const value = JSON.parse(match[0]);
      return Array.isArray(value) && value.every((v) => typeof v === 'string') ? value : null;
    } catch {
      return null;
    }
  }
}
