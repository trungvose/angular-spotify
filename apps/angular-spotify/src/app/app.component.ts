import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { GoogleAnalyticsService } from './google-analytics.service';

@Component({
  selector: 'angular-spotify-root',
  template: ` <router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private router: Router, private googleAnalytics: GoogleAnalyticsService) {
    if (environment.production) {
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((navigationEndEvent) => {
          this.googleAnalytics.sendPageView(
            (navigationEndEvent as NavigationEnd).urlAfterRedirects
          );
        });
    }
  }
}
