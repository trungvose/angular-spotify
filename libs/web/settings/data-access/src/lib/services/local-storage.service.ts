/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable } from '@angular/core';

const APP_PREFIX = 'AS-';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  /**
   * Returns all initial variables
   * from local storage
   *
   * @static
   * @return {any}
   */
  public static loadInitialState(): any {
    return Object.keys(localStorage).reduce((state: any, storageKey) => {
      if (storageKey.startsWith(APP_PREFIX)) {
        const stateKeys = storageKey
          .replace(APP_PREFIX, '')
          .toLowerCase()
          .split('.')
          .map((key) =>
            key
              .split('-')
              .map((token, index) =>
                index === 0 ? token : token.charAt(0).toUpperCase() + token.slice(1)
              )
              .join('')
          );

        let currentStateRef = state;
        stateKeys.forEach((key, index) => {
          if (index === stateKeys.length - 1) {
            currentStateRef[key] = JSON.parse(localStorage.getItem(storageKey) as string);
            return;
          }
          currentStateRef[key] = currentStateRef[key] || {};
          currentStateRef = currentStateRef[key];
        });
      }

      return state;
    }, {});
  }

  /**
   * Sets item in local storage
   *
   * @param {string} key
   * @param {*} value
   */
  public setItem(key: string, value: any) {
    try {
      localStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(value));
    } catch (e) {
      localStorage.setItem(`${APP_PREFIX}${key}`, value);
    }
  }

  /**
   * Gets item from local storage by key
   *
   * @param {string} key
   * @return {*}  {*}
   */
  public getItem(key: string): any {
    const value = localStorage.getItem(`${APP_PREFIX}${key}`);
    try {
      return JSON.parse(value as any);
    } catch (e) {
      return value;
    }
  }

  /**
   * Removes item from local storage by key
   *
   * @param {string} key
   */
  public removeItem(key: string) {
    localStorage.removeItem(`${APP_PREFIX}${key}`);
  }
}
