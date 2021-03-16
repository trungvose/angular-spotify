import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'as-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaComponent {
  @Input() imageUrl = '';
  @Input() title = '';
  @Input() description: string | null = '';
  @Input() routerUrl = '';
}
