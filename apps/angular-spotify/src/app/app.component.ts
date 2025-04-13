import { Component } from '@angular/core';

@Component({
  selector: 'angular-spotify-root',
  template: ` <router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  title = 'angular-spotify';
}
