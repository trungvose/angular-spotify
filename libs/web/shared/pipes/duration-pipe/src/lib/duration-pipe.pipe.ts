import { Pipe, PipeTransform } from '@angular/core';
import { TimeUtil } from '@angular-spotify/web/util';
@Pipe({
  name: 'duration'
})
export class DurationPipePipe implements PipeTransform {
  transform(durationInMs: number): string {
    return TimeUtil.formatDuration(durationInMs);
  }
}
