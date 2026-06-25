import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { SavedTracksStore } from '@angular-spotify/web/shared/data-access/store';

@Component({
  selector: 'as-like-button',
  templateUrl: './like-button.component.html',
  styleUrls: ['./like-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LikeButtonComponent implements OnChanges {
  @Input() trackId!: string;

  isSaved$!: Observable<boolean>;

  constructor(private savedTracksStore: SavedTracksStore) {}

  ngOnChanges(): void {
    this.isSaved$ = this.savedTracksStore.isSaved$(this.trackId);
  }

  toggle(event: MouseEvent, currentlySaved: boolean): void {
    event.stopPropagation();
    this.savedTracksStore.toggleSave({ id: this.trackId, currentlySaved });
  }
}
