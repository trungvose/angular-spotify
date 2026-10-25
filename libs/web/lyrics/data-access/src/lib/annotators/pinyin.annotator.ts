import { PromptAnnotatorConfig } from '../annotation.models';
import { containsHan } from '../script-util';

export const PINYIN_ANNOTATOR: PromptAnnotatorConfig = {
  id: 'pinyin',
  kind: 'prompt',
  matchesLanguage: (lang) => lang.startsWith('zh'),
  lineQualifies: containsHan,
  systemPrompt:
    'You are a precise Chinese-to-Hanyu-Pinyin transliterator. ' +
    'Output pinyin WITH tone marks (ā á ǎ à). Do not translate meaning.',
  batchInstruction:
    'Convert each line of this Chinese text to Hanyu Pinyin with tone marks. ' +
    'Return ONLY a JSON array of strings, one pinyin line per input line, no extra text.',
  toggle: {
    icon: '拼',
    tooltipShow: 'Show pinyin',
    tooltipHide: 'Hide pinyin',
    preparingLabel: 'Preparing pinyin…'
  }
};
