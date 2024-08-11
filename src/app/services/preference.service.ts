import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  private darkMode = signal<boolean>(false);
  hideCompleted = signal(false);
  hideDLC = signal(false);
  hideBaseGame = signal(false);

  constructor() {

    const restore = localStorage.getItem('dark-mode');
    if (restore) {
      this.darkMode.set(restore === 'true');
    } else {
      this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    effect(() => {
      localStorage.setItem('dark-mode', this.darkMode().toString());
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
