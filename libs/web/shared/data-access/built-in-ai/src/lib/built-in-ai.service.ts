import { Injectable } from '@angular/core';
import { CreateSessionOptions, LanguageDetectionResult, PinyinSession } from './built-in-ai.types';

export const PINYIN_SYSTEM_PROMPT =
  'You are a precise Chinese-to-Hanyu-Pinyin transliterator. ' +
  'Output pinyin WITH tone marks (ā á ǎ à). Do not translate meaning.';

@Injectable({ providedIn: 'root' })
export class BuiltInAiService {
  isPromptApiAvailable(): boolean {
    return typeof globalThis.LanguageModel !== 'undefined';
  }

  isDetectorAvailable(): boolean {
    return typeof globalThis.LanguageDetector !== 'undefined';
  }

  async detectLanguage(text: string): Promise<LanguageDetectionResult | null> {
    if (!this.isDetectorAvailable()) {
      return null;
    }
    try {
      const t0 = performance.now();
      const detector = await globalThis.LanguageDetector!.create();
      const results = await detector.detect(text);
      console.log(`[BuiltInAI] detectLanguage: ${(performance.now() - t0).toFixed(1)}ms`);
      const top = results[0];
      return top ? { lang: top.detectedLanguage, confidence: top.confidence } : null;
    } catch {
      return null;
    }
  }

  async createPinyinSession(opts: CreateSessionOptions = {}): Promise<PinyinSession> {
    if (!this.isPromptApiAvailable()) {
      throw new Error('Prompt API unavailable');
    }
    const t0 = performance.now();
    const session = await globalThis.LanguageModel!.create({
      initialPrompts: [{ role: 'system', content: PINYIN_SYSTEM_PROMPT }],
      signal: opts.signal,
      monitor: (m) =>
        m.addEventListener('downloadprogress', (e) => opts.onDownloadProgress?.(e.loaded))
    });
    console.log(`[BuiltInAI] createPinyinSession: ${(performance.now() - t0).toFixed(1)}ms`);
    return session;
  }

  async promptPinyinBatch(
    session: PinyinSession,
    lines: string[],
    signal?: AbortSignal
  ): Promise<string[]> {
    const prompt =
      'Convert each line of this Chinese text to Hanyu Pinyin with tone marks. ' +
      'Return ONLY a JSON array of strings, one pinyin line per input line, no extra text.\n\n' +
      lines.join('\n');
    console.log(`[BuiltInAI] promptPinyinBatch → sending ${lines.length} lines:`, lines);
    const t0 = performance.now();
    const raw = await session.prompt(prompt, { signal });
    console.log(`[BuiltInAI] promptPinyinBatch ← ${(performance.now() - t0).toFixed(1)}ms raw:`, raw);
    const parsed = this.parseArray(raw);
    if (!parsed || parsed.length !== lines.length) {
      throw new Error(`Pinyin parse failed: expected ${lines.length} lines`);
    }
    return parsed;
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
