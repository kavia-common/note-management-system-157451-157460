import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type FilterKey = 'all' | 'starred';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  // PUBLIC_INTERFACE
  /** Emits the selected filter key. */
  @Output() filterChange = new EventEmitter<FilterKey>();

  active = signal<FilterKey>('all');

  setActive(key: FilterKey) {
    this.active.set(key);
    this.filterChange.emit(key);
  }
}
