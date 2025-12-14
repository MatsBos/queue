import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  get isLocked(): boolean {
    return localStorage.getItem('isLocked') === 'true';
  }

  set isLocked(value: boolean) {
    localStorage.setItem('isLocked', String(value));
  }
}
