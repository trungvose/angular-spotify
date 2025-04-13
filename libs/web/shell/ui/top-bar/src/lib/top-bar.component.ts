import { SocialShareComponent } from '@angular-spotify/web/shell/ui/social-share';
import { UserDropdownComponent } from '@angular-spotify/web/shell/ui/user-dropdown';
import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, UserDropdownComponent, SocialShareComponent],
})
export class TopBarComponent {
  constructor(private location: Location) {}

  back() {
    this.location.back();
  }

  forward() {
    this.location.forward();
  }
}
