import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { GoogleAnalyticsService } from './google-analytics.service';
import { PromptUpdateService } from './promp-update.service';

@Component({
  selector: 'angular-spotify-root',
  template: ` <router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private googleAnalytics: GoogleAnalyticsService,
    private promptUpdate: PromptUpdateService
  ) {}

  ngOnInit() {
    if (environment.production) {
      this.initGoogleAnalytics();
      this.initForceUpdate();
    }
  }

  private initGoogleAnalytics() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((navigationEndEvent) => {
        this.googleAnalytics.sendPageView((navigationEndEvent as NavigationEnd).urlAfterRedirects);
      });
  }
  
  private initForceUpdate() {
    this.promptUpdate.forceUpdate().subscribe();
  }
}
