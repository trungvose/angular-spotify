import { createAction, props } from '@ngrx/store';

export const persistVolume = createAction('[Settings] Persist Volume', props<{ volume: number }>());
