import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export const extModules = [
  StoreDevtoolsModule.instrument({
    maxAge: 25
  , connectInZone: true})
];
