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
        path: 'browse',
        loadChildren: async () => (await import('@angular-spotify/web/browse/feature')).BrowseModule
      },
      {
        path: 'collection/playlists',
        loadChildren: async () =>
          (await import('@angular-spotify/web/playlist/feature/list')).PlaylistsModule
      },
      {
        path: 'collection/tracks',
        loadChildren: async () => (await import('@angular-spotify/web/tracks/feature')).TracksModule
      },
      {
        path: `playlist`,
        loadChildren: async () =>
          (await import('@angular-spotify/web/playlist/feature/detail')).PlaylistModule
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
        path: RouterUtil.Configuration.Visualizer,
        loadChildren: async () =>
          (await import('@angular-spotify/web/visualizer/feature')).VisualizerModule
      },
      {
        path: 'collection',
        redirectTo: 'collection/playlists',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'collection',
    pathMatch: 'full'
  }
];
