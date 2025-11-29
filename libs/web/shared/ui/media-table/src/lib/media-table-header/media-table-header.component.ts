import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-media-table-header',
  templateUrl: './media-table-header.component.html',
  styleUrls: ['./media-table-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class MediaTableHeaderComponent {

}
