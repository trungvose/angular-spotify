import { PromptAnnotatorConfig } from '../annotation.models';
import { containsJapanese } from '../script-util';

export const ROMAJI_ANNOTATOR: PromptAnnotatorConfig = {
  id: 'romaji',
  kind: 'prompt',
  matchesLanguage: (lang) => lang.startsWith('ja'),
  lineQualifies: containsJapanese,
  systemPrompt:
    'You are a precise Japanese-to-romaji transliterator. ' +
    'Romanize kanji, hiragana, and katakana into Hepburn romaji ' +
    'with macrons for long vowels (ō, ū). Do not translate meaning.',
  batchInstruction:
    'Convert each line of this Japanese text to Hepburn romaji. ' +
    'Return ONLY a JSON array of strings, one romaji line per input line, no extra text.',
  toggle: {
    icon: 'あ',
    tooltipShow: 'Show romaji',
    tooltipHide: 'Hide romaji',
    preparingLabel: 'Preparing romaji…'
  }
};
