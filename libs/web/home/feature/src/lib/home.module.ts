import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { HomeEffect, homeFeatureKey, homeReducer } from '@angular-spotify/web/home/data-access';
import { EffectsModule } from '@ngrx/effects';
import { GreetingModule } from '@angular-spotify/web/home/ui/greeting';
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
    StoreModule.forFeature(homeFeatureKey, homeReducer),
    EffectsModule.forFeature([HomeEffect]),
    GreetingModule,
    RecentPlayedModule
  ],
  declarations: [HomeComponent],
  exports: [HomeComponent]
})
export class HomeModule {}
