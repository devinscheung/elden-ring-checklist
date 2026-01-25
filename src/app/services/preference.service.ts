import { effect, inject, Injectable, signal } from '@angular/core';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  private platformService = inject(PlatformService);
  private darkMode = signal<boolean>(false);
  hideCompleted = signal(false);
  hideDLC = signal(false);
  hideBaseGame = signal(false);

  constructor() {
    if(this.platformService.isBrowser()) {
      const restore = localStorage.getItem('dark-mode');
      if (restore) {
        this.darkMode.set(restore === 'true');
      } else {
        this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    }

    effect(() => {
      if(this.platformService.isBrowser()) {
        localStorage.setItem('dark-mode', this.darkMode().toString());
      }
    });
  }

  getState() {
    return this.darkMode();
  }

  toggleDarkMode() {
    this.darkMode.set(!this.darkMode());
  }

  toggleHideCompleted() {
    this.hideCompleted.set(!this.hideCompleted());
  }

  toggleHideDLC() {
    this.hideDLC.set(!this.hideDLC());
  }

  toggleHideBaseGame() {
    this.hideBaseGame.set(!this.hideBaseGame());
  }
}
