import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { GoogleAnalyticsService } from './google-analytics.service';

@Component({
  selector: 'angular-spotify-root',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private router: Router, private googleAnalytics: GoogleAnalyticsService) {
    if (environment.production) {
      this.router.events.subscribe(this.handleGoogleAnalytics);
    }
  }

  handleGoogleAnalytics = (event: any): void => {
    // eslint-disable-line
    if (event instanceof NavigationEnd) {
      this.googleAnalytics.sendPageView(event.urlAfterRedirects);
    }
  };
}
