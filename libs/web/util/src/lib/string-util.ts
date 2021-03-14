export class StringUtil {
  static getIdFromUri(uri: string) {
    const ids = uri.split(':');
    return ids[ids.length - 1];
  }
}
