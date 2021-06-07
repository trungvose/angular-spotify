import { action as createAction, props } from 'ts-action';

export const persistVolume = createAction('[Settings] Persist Volume', props<{ volume: number }>());
