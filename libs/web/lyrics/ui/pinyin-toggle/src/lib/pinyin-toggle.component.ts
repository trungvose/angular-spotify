import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PinyinStore } from '@angular-spotify/web/lyrics/data-access';

@Component({
  selector: 'as-pinyin-toggle',
  templateUrl: './pinyin-toggle.component.html',
  styleUrls: ['./pinyin-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PinyinToggleComponent {
  showToggle$ = this.pinyinStore.showToggle$;
  isEnabled$ = this.pinyinStore.enabled$;
  private isEnabled = true;

  constructor(private pinyinStore: PinyinStore) {
    this.isEnabled$.subscribe((v) => (this.isEnabled = v));
  }

  toggle(): void {
    this.pinyinStore.setEnabled(!this.isEnabled);
  }
}
