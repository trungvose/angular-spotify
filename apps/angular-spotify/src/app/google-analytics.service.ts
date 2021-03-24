import { Injectable } from '@angular/core';
declare const gtag: any; // eslint-disable-line
const GOOGLE_ANALYTICS_ID = 'G-24YF96FX0G';

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  gtag: any; // eslint-disable-line
  constructor() {
    if (typeof gtag !== 'undefined') {
      this.gtag = gtag;
    }
  }

  public sendEvent = (
    eventName: string,
    eventCategory: string,
    eventLabel?: string,
    eventValue?: number
  ) => {
    if (!this.gtag) {
      return;
    }
    this.gtag('event', eventName, {
      /* eslint-disable @typescript-eslint/naming-convention */
      event_category: eventCategory,
      event_label: eventLabel,
      /* eslint-enable @typescript-eslint/naming-convention */
      value: eventValue
    });
  };

  public sendPageView(url: string) {
    if (!this.gtag) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.gtag('config', GOOGLE_ANALYTICS_ID, { page_path: url });
  }
}
