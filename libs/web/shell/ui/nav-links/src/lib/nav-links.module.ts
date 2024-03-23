import { MediaCoverModule } from '@angular-spotify/web/shared/ui/media-cover';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { SpinnerModule } from '@angular-spotify/web/shared/ui/spinner';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LetDirective, PushPipe } from '@ngrx/component';
import { NavLinksComponent } from './nav-links.component';
import { NavLinkComponent } from './nav-link/nav-link.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    PlayButtonModule,
    LetDirective,
    PushPipe,
    SpinnerModule,
    MediaCoverModule
  ],
  declarations: [NavLinksComponent, NavLinkComponent],
  exports: [NavLinksComponent]
})
export class NavLinksModule {}
