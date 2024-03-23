const { getJestProjects } = require('@nx/jest');

export default {
  projects: [
    ...getJestProjects(),
    '<rootDir>/libs/web/shell',
    '<rootDir>/libs/web/layout',
    '<rootDir>/libs/web/shared/ui/nav-bar',
    '<rootDir>/libs/web/shared/data-access/ui-store',
    '<rootDir>/libs/web/shared/ui/nav-bar-playlist',
    '<rootDir>/libs/web/shared/ui/top-bar',
    '<rootDir>/libs/web/shared/ui/main-view',
    '<rootDir>/libs/web/auth//data-access',
    '<rootDir>/libs/shared/data-access/spotify-api',
    '<rootDir>/libs/shared/app-config',
    '<rootDir>/libs/web/shared/data-access/playlist-store',
    '<rootDir>/libs/web/util',
    '<rootDir>/libs/web/shared/ui/playlist-track',
    '<rootDir>/libs//libs/web/visualizer/data-access',
    '<rootDir>/libs//libs/web/playlist/data-access',
    '<rootDir>/libs/web/album/feature',
    '<rootDir>/libs/web/collection/tracks/feature',
    '<rootDir>/libs/web/browse/feature',
    '<rootDir>/libs/web/browse/feature/detail'
  ]
};
