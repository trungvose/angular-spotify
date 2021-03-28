import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrowseComponent {}
