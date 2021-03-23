import { Route } from '@angular/router';
import { LayoutComponent } from '@angular-spotify/web/shell/ui/layout';

export const webShellRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'collection/playlists',
        loadChildren: async () =>
          (await import('@angular-spotify/web/collection/playlists')).PlaylistsModule
      },
      {
        path: 'collection',
        redirectTo: 'collection/playlists',
        pathMatch: 'full'
      },
      {
        path: 'playlist/:playlistId',
        loadChildren: async () =>
          (await import('@angular-spotify/web/playlist/feature')).PlaylistModule
      },
      {
        path: 'visualizer',
        loadChildren: async () =>
          (await import('@angular-spotify/web/visualizer/feature')).VisualizerModule
      }
    ]
  },
  {
    path: '',
    redirectTo: 'collection',
    pathMatch: 'full'
  }
];
