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
import { GreetingModule } from '@angular-spotify/web/home/ui/greeting';
import { FeaturedPlaylistsModule } from '@angular-spotify/web/home/ui/featured-playlists';
import { RecentPlayedModule } from '@angular-spotify/web/home/ui/recent-played';
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
    GreetingModule,
    RecentPlayedModule,
    FeaturedPlaylistsModule
  ],
  declarations: [HomeComponent],
  exports: [HomeComponent]
})
export class HomeModule {}
