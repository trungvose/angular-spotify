import { Injectable } from '@angular/core';
import { LanguageDetectionResult } from './built-in-ai.types';

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
      const detector = await globalThis.LanguageDetector!.create();
      const results = await detector.detect(text);
      const top = results[0];
      return top ? { lang: top.detectedLanguage, confidence: top.confidence } : null;
    } catch {
      return null;
    }
  }
}
