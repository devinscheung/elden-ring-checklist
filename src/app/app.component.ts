import { NgClass } from '@angular/common';
import { Component, computed, HostBinding, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { PreferenceService } from './services/preference.service';
import { ListComponent } from './list/list.component';
import { Item } from './interface/item';
import { PlatformService } from './services/platform.service';
import { data } from './environment';
declare var gtag: Function;

@Component({
    selector: 'app-root',
    imports: [NgClass, ListComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'elden-ring-checklist';

  private preferenceService = inject(PreferenceService);
  private platformService = inject(PlatformService);

  items: Map<string, WritableSignal<Item[]>> = new Map([
    ['melee', signal<Item[]>(data.melee)],
    ['ranged', signal<Item[]>(data.ranged)],
    ['sorceries', signal<Item[]>(data.sorceries)],
    ['incantations', signal<Item[]>(data.incantations)],
    ['ashes', signal<Item[]>(data.ashes)],
    ['war', signal<Item[]>(data.war)],
    ['shields', signal<Item[]>(data.shields)],
    ['head', signal<Item[]>(data.head)],
    ['chest', signal<Item[]>(data.chest)],
    ['arms', signal<Item[]>(data.arms)],
    ['legs', signal<Item[]>(data.legs)],
    ['talismans', signal<Item[]>(data.talismans)],
    ['key-items', signal<Item[]>(data.keyItems)],
    ['ng', signal<Item[]>(data.ng)]
  ]);

  itemsDisplayName: Map<string, string> = new Map([
    ['melee', '近戰武器'],
    ['ranged', '遠戰武器'],
    ['sorceries', '魔法'],
    ['incantations', '禱告'],
    ['ashes', '骨灰'],
    ['war', '戰灰'],
    // ['arrows', '箭／弩箭']
    ['shields', '盾牌'],
    ['head', '頭盔'],
    ['chest', '鎧甲'],
    ['arms', '臂甲'],
    ['legs', '腿甲'],
    ['talismans', '護符'],
    ['key-items', '貴重物品'],
    // ['info', '情報'],
    ['ng', '多周目']
  ]);

  selectedType = signal('melee');
  searchValue = signal('');
  notes = signal('');
  isResetModalOpen = signal(false);
  isResetPageModalOpen = signal(false);

  isHideCompleted = computed(() => this.preferenceService.hideCompleted());
  isHideDLC = computed(() => this.preferenceService.hideDLC());
  isHideBaseGame = computed(() => this.preferenceService.hideBaseGame());

  async ngOnInit() {
    if(this.platformService.isBrowser()){
      this.restoreFromLocalStorage();
    }
  }

  restoreFromLocalStorage() {
    let restored = false;
    this.items.forEach(async (signal, key) => {
      
      const storedData = localStorage.getItem(key);
      if (!storedData) return;
  
      const items = JSON.parse(storedData);
      if (!Array.isArray(items)) return;
  
      const typeData = this.items.get(key);
      if (!typeData) return;
  
      typeData().forEach(item => {
        const foundItem = items.find(storedItem => storedItem.name === item.name);
        item.completed = !!foundItem;
      });
      restored = true;
    })
    if (restored) this.logger('dataRestored');
  }

  download() {
    const selectedItems: { [key: string]: string[] } = {};
  
    this.items.forEach((signal, key) => {
      selectedItems[key] = signal().reduce((acc, item) => {
        if (item.completed) acc.push(item.name);
        return acc;
      }, [] as string[]);
    });
  
    const dataStr = JSON.stringify(selectedItems);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const today = new Date().toISOString().split('T')[0];
    const exportFileDefaultName = 'devin.uk_app_elden-ring(' + today + ').json';
  
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement); // Required for Firefox
    linkElement.click();
    document.body.removeChild(linkElement); // Clean up
    this.logger('dataExported');
  }

  upload(event: any) {
    try {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const items: { [key: string]: string[] } = JSON.parse(content);
  
            this.items.forEach((signal, key) => {
              if (items[key]) {
                const itemNames = new Set(items[key]);
                const updatedItems = signal().map(item => {
                  item.completed = itemNames.has(item.name);
                  return item;
                });
                signal.set(updatedItems);
                if(this.platformService.isBrowser()){
                  localStorage.setItem(key, JSON.stringify(updatedItems.filter(item => item.completed)));
                }
              }
            });
          } catch (jsonError) {
            alert('檔案格式錯誤，請匯入從此網站下載的json檔案。');
          }
        };
        reader.readAsText(file);
        this.logger('dataImported');
      }
    } catch (error) {
      alert('發生錯誤，請重試。');
    }
  }
  

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  toggleDarkMode() {
    this.preferenceService.toggleDarkMode();
  }

  toggleHideCompleted() {
    this.preferenceService.toggleHideCompleted();
  }

  toggleHideDLC() {
    this.preferenceService.toggleHideDLC();
  }

  toggleHideBaseGame() {
    this.preferenceService.toggleHideBaseGame();
  }

  getPagedData(){
    return this.items.get(this.selectedType())!();
  }

  reset(){
    this.items.forEach((signal, key) => {
      signal().forEach(item => item.completed = false);
      if(this.platformService.isBrowser()){
        localStorage.removeItem(key);
      }
    });
    this.isResetModalOpen.set(false);
    this.logger('resetAll');
  }

  resetPage(){;
    this.items.get(this.selectedType())!().forEach(item => item.completed = false);
    if(this.platformService.isBrowser()){
      localStorage.removeItem(this.selectedType());
    }
    this.isResetPageModalOpen.set(false);
    this.logger('resetPage');
    window.location.reload();
  }

  logger(event: string) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      if (typeof gtag !== 'undefined') {
        gtag('event', event, {
          'app_platform': 'elden-ring-tracker',
          'event_category': 'user_interaction'
        });
      }
    }
  }
}
