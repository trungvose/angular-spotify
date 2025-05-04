import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import {
  RecentPlayedTracksEffect,
  recentFeatureTracksFeatureKey,
  recentPlayedTracksReducer,
  FeaturePlaylistsEffect,
  featuredPlaylistsFeatureKey,
  featuredPlaylistsReducer
} from '@angular-spotify/web/home/data-access';
import { EffectsModule } from '@ngrx/effects';
import { RecentPlayedComponent } from '@angular-spotify/web/home/ui/recent-played';
import { GreetingComponent } from 'libs/web/home/ui/greeting/src/lib/greeting.component';
import { FeaturedPlaylistsComponent } from 'libs/web/home/ui/featured-playlists/src/lib/featured-playlists.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent
      }
    ]),
    StoreModule.forFeature(recentFeatureTracksFeatureKey, recentPlayedTracksReducer),
    StoreModule.forFeature(featuredPlaylistsFeatureKey, featuredPlaylistsReducer),
    EffectsModule.forFeature([RecentPlayedTracksEffect, FeaturePlaylistsEffect]),
    GreetingComponent,
    RecentPlayedComponent,
    FeaturedPlaylistsComponent
  ],
  declarations: [HomeComponent],
  exports: [HomeComponent]
})
export class HomeModule {}
