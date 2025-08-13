import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import type { Note } from '../../models/note.model';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css'],
})
export class NotesListComponent {
  // PUBLIC_INTERFACE
  @Input() set notes(value: Note[] | null | undefined) {
    this._notes.set(value ?? []);
  }
  // PUBLIC_INTERFACE
  @Input() selectedId?: string;

  // PUBLIC_INTERFACE
  @Output() select = new EventEmitter<Note>();
  // PUBLIC_INTERFACE
  @Output() remove = new EventEmitter<Note>();
  // PUBLIC_INTERFACE
  @Output() toggleStar = new EventEmitter<Note>();

  protected _notes = signal<Note[]>([]);
  protected ordered = computed(() =>
    [...this._notes()].sort((a, b) => {
      const ad = a.updatedAt ?? a.createdAt ?? '';
      const bd = b.updatedAt ?? b.createdAt ?? '';
      return ad < bd ? 1 : ad > bd ? -1 : 0;
    })
  );

  onSelect(n: Note) {
    this.select.emit(n);
  }

  onDelete(n: Note, ev: MouseEvent) {
    ev.stopPropagation();
    this.remove.emit(n);
  }

  onToggleStar(n: Note, ev: MouseEvent) {
    ev.stopPropagation();
    this.toggleStar.emit(n);
  }

  protected excerpt(text: string, max = 120): string {
    const t = (text || '').replace(/\s+/g, ' ').trim();
    return t.length > max ? t.slice(0, max) + '…' : t;
  }
}
