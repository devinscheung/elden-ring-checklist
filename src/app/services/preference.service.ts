import { effect, inject, Injectable, signal } from '@angular/core';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  private platformService = inject(PlatformService);
  private darkMode = signal<boolean>(
    this.platformService.isBrowser() 
      ? document.documentElement.classList.contains('dark') 
      : false
  );

  hideCompleted = signal(false);
  hideDLC = signal(false);
  hideBaseGame = signal(false);

  constructor() {
    effect(() => {
      if(this.platformService.isBrowser()) {
        const isDark = this.darkMode();
        
        // sync to localStorage
        localStorage.setItem('dark-mode', isDark.toString());
        
        // directly control html tag (better than @HostBinding)
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
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
