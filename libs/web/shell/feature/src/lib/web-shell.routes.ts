import { Route } from '@angular/router';
import { LayoutComponent } from '@angular-spotify/web/shell/ui/layout';
import { RouterUtil } from '@angular-spotify/web/util';

export const webShellRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: async () => (await import('@angular-spotify/web/home/feature')).HomeModule
      },
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
        path: `playlist`,
        loadChildren: async () =>
          (await import('@angular-spotify/web/playlist/feature')).PlaylistModule
      },
      {
        path: `album`,
        loadChildren: async () => (await import('@angular-spotify/web/album/feature')).AlbumModule
      },
      {
        path: `artist`,
        loadChildren: async () => (await import('@angular-spotify/web/artist/feature')).ArtistModule
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
