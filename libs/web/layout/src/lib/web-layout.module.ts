import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { RouterModule } from '@angular/router';
import { NavBarModule } from '@angular-spotify/web/shared/ui/nav-bar';
import { TopBarModule } from '@angular-spotify/web/shared/ui/top-bar';
import { MainViewModule } from '@angular-spotify/web/shared/ui/main-view';
import { StoreModule } from '@ngrx/store';
@NgModule({
  imports: [
    CommonModule, 
    StoreModule, 
    RouterModule, 
    NavBarModule, 
    TopBarModule, 
    MainViewModule
  ],
  declarations: [LayoutComponent],
  exports: [LayoutComponent]
})
export class WebLayoutModule {}
