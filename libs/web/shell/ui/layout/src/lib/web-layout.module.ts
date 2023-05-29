import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { RouterModule } from '@angular/router';
import { NavBarModule } from '@angular-spotify/web/shell/ui/nav-bar';
import { TopBarModule } from '@angular-spotify/web/shell/ui/top-bar';
import { MainViewModule } from '@angular-spotify/web/shell/ui/main-view';
import { StoreModule } from '@ngrx/store';
import { NowPlayingBarModule } from '@angular-spotify/web/shell/ui/now-playing-bar';
import { UnauthorizedModalModule } from '@angular-spotify/web/auth/ui/unauthorized-modal';
import { AlbumArtOverlayModule } from '@angular-spotify/web/shell/ui/album-art-overlay';
import { WebVisualizerUiModule } from '@angular-spotify/web/visualizer/ui';
import { DataSizeObserverDirective } from '@angular-spotify/web/shared/directives/data-size-observer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule,
    RouterModule,
    NavBarModule,
    TopBarModule,
    MainViewModule,
    NowPlayingBarModule,
    UnauthorizedModalModule,
    AlbumArtOverlayModule,
    WebVisualizerUiModule,
    DataSizeObserverDirective
  ],
  declarations: [LayoutComponent],
  exports: [LayoutComponent]
})
export class WebLayoutModule {}
