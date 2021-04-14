import { StoreDevtoolsModule } from 'mini-rx-store-ng';

export const extModules = [
  StoreDevtoolsModule.instrument({
    maxAge: 25
  })
];
