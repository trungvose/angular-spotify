import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-social-share',
  template: `
    <div class="social-share-container">
      <a
        nz-button
        class="btn-with-icon"
        target="_blank"
        href="https://www.buymeacoffee.com/trungvose"
      >
        <svg-icon [key]="'cup-straw'"></svg-icon>
        <span>Support</span>
      </a>
      <a nz-button class="btn-with-icon" target="_blank" href="https://jira.trungk18.com/">
        <svg-icon [key]="'emoji-heart-eyes'"></svg-icon>
        <span>Jira Clone</span>
      </a>
      <a
        nz-button
        class="btn-with-icon"
        target="_blank"
        href="https://twitter.com/intent/tweet?url=https://github.com/trungk18/angular-spotify&text=A%20cool%20Spotify%20client%20made%20with%20Angular%2011,%20Nx%20workspace,%20ngrx,%20TailwindCSS%20and%20ng-zorro%20%40trungvose&hashtags=angularspotify,angular,nx,ngrx,ngzorro,typescript"
      >
        <svg-icon [key]="'twitter'"></svg-icon>
        <span>Tweet</span>
      </a>
      <a
        nz-button
        class="btn-with-icon"
        target="_blank"
        href="https://github.com/trungk18/angular-spotify"
      >
        <svg-icon [key]="'github'"></svg-icon>
        <span>Source Code</span>
      </a>
    </div>
  `,
  styleUrls: ['./social-share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialShareComponent {}
