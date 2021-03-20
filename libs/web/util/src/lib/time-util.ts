export class TimeUtil {
  static pad(num: number, length = 2) {
    return `${num}`.padStart(length, '0');
  }

  static formatDuration(durationInMs: number) {
    const minutes = Math.floor(durationInMs / 60000);
    const seconds = Math.floor((durationInMs % 60000) / 1000);
    if (seconds === 60) {
      return `${minutes + 1}:00`;
    }
    return `${minutes}:${this.pad(seconds)}`;
  }
}
