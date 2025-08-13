import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  // PUBLIC_INTERFACE
  /** Fired whenever the debounced search text changes. */
  @Output() searchChange = new EventEmitter<string>();

  // PUBLIC_INTERFACE
  /** Fired when the user clicks to create a new note. */
  @Output() createNew = new EventEmitter<void>();

  protected searchText = signal<string>('');
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((txt) => {
      this.searchChange.emit(txt);
    });
  }

  onSearchInput(value: string) {
    this.searchText.set(value);
    this.searchSubject.next(value);
  }

  onCreate() {
    this.createNew.emit();
  }
}
