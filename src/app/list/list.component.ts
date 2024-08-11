import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PreferenceService } from '../services/preference.service';
import { Item } from '../interface/item';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {

  private fb = inject(FormBuilder);
  private preferenceService = inject(PreferenceService);
  
  data = input<Item[]>([]);
  type = input('');

  notes = signal('');
  selectedNumber = signal(0);
  searchValue = signal('');

  totalNumber = computed(() => 
    this.data().length
  );

  isHideCompleted = computed(() => 
    this.preferenceService.hideCompleted()
  );

  isHideDLC = computed(() => 
    this.preferenceService.hideDLC()
  );

  isHideBaseGame = computed(() => 
    this.preferenceService.hideBaseGame()
  );
  
  filteredItems = computed(() => {
    const search = this.searchValue().toLowerCase().trim();
    return this.data().filter(item => item.name.toLowerCase().includes(search) || item.type?.toLowerCase().includes(search) || item.notes?.toLowerCase().includes(search));
  });
  
  searchForm: FormGroup;

  constructor() {
    this.searchForm = this.fb.group({
      search: ['']
    });
    this.searchForm.get('search')?.valueChanges.subscribe(value => {
      this.searchValue.set(value);
    });

    effect(() => {
      this.selectedNumber.set(this.data().filter(item => item.completed).length);
    }, { allowSignalWrites: true })
  }

  changed(event:any, item:any){
    item.completed = event.target.checked;
    localStorage.setItem(this.type(), JSON.stringify(this.data().filter(item => item.completed)));
    this.selectedNumber.set(this.data().filter(item => item.completed).length);
  }
}
