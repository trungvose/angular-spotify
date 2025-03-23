import { createAction } from '@ngrx/store';

export const AppInit = createAction('[App] Init');
export const AuthExistingSession = createAction('[Auth] Existing Session');
export const AuthCodeReady = createAction('[Auth] Code Ready');
export const AuthSessionReady = createAction('[Auth] Access Token Ready');
