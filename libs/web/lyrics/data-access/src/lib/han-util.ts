const HAN_REGEX = /[㐀-䶿一-鿿豈-﫿]/;

export function containsHan(text: string): boolean {
  return HAN_REGEX.test(text);
}
