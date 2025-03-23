import { createAction } from '@ngrx/store';

export const AppInit = createAction('[App] Init');
export const AuthCodeReady = createAction('[Auth] Code Ready');
export const AuthAccessTokenReady = createAction('[Auth] Access Token Ready');
