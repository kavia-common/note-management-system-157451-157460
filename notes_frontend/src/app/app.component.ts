import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NotesListComponent } from './components/notes-list/notes-list.component';
import { NoteEditorComponent } from './components/note-editor/note-editor.component';
import { NotesService } from './services/notes.service';
import type { Note } from './models/note.model';

type FilterKey = 'all' | 'starred';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, NotesListComponent, NoteEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Notes';

  // Inject NotesService without constructor to avoid linter false-positives on unused constructor params
  private readonly notesSvc = inject(NotesService);

  protected notes = signal<Note[]>([]);
  protected searchQuery = signal<string>('');
  protected filter = signal<FilterKey>('all');
  protected selected: Note | undefined;

  protected filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const f = this.filter();
    return this.notes().filter((n) => {
      const matchesQuery =
        !q ||
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q);
      const matchesFilter = f === 'all' ? true : !!n.starred;
      return matchesQuery && matchesFilter;
    });
  });

  ngOnInit(): void {
    this.loadNotes();
  }

  // PUBLIC_INTERFACE
  /**
   * Refresh the notes list using the service with optional search.
   */
  loadNotes(): void {
    const q = this.searchQuery();
    this.notesSvc.listNotes(q).subscribe({
      next: (data) => this.notes.set(data),
      error: (err) => console.error('Failed to load notes', err),
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Called when the search text changes from header.
   */
  onSearchChange(q: string): void {
    this.searchQuery.set(q);
    this.loadNotes();
  }

  // PUBLIC_INTERFACE
  /**
   * Called when the sidebar filter changes.
   */
  onFilterChange(f: FilterKey): void {
    this.filter.set(f);
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new empty note and open the editor.
   */
  onCreateNew(): void {
    this.selected = { title: '', content: '', starred: false };
  }

  // PUBLIC_INTERFACE
  /**
   * Handle selection in the list.
   */
  onSelectNote(n: Note): void {
    this.selected = n;
  }

  // PUBLIC_INTERFACE
  /**
   * Handle delete request from the list.
   */
  onDeleteNote(n: Note): void {
    if (!n.id) {
      return;
    }
    this.notesSvc.deleteNote(n.id).subscribe({
      next: () => {
        this.notes.set(this.notes().filter((x) => x.id !== n.id));
        if (this.selected?.id === n.id) {
          this.selected = undefined;
        }
      },
      error: (err) => console.error('Failed to delete note', err),
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Toggle starred on a note (client-side) and persist if it has an id.
   */
  onToggleStar(n: Note): void {
    const updated: Note = { ...n, starred: !n.starred };
    if (!n.id) {
      // Update in local state if not yet persisted
      this.selected = updated;
      return;
    }
    this.notesSvc.updateNote(n.id, { starred: updated.starred }).subscribe({
      next: (res) => {
        // Update local collection
        this.notes.set(this.notes().map((x) => (x.id === res.id ? res : x)));
        if (this.selected?.id === res.id) {
          this.selected = res;
        }
      },
      error: (err) => console.error('Failed to update star', err),
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Save handler from the editor - creates or updates note.
   */
  onSaveNote(n: Note): void {
    if (n.id) {
      this.notesSvc.updateNote(n.id, n).subscribe({
        next: (res) => {
          this.notes.set(this.notes().map((x) => (x.id === res.id ? res : x)));
          this.selected = res;
        },
        error: (err) => console.error('Failed to update note', err),
      });
    } else {
      this.notesSvc.createNote(n).subscribe({
        next: (res) => {
          this.notes.set([res, ...this.notes()]);
          this.selected = res;
        },
        error: (err) => console.error('Failed to create note', err),
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Cancel editing - deselect current note if it wasn't persisted.
   */
  onCancelEdit(): void {
    if (!this.selected?.id) {
      this.selected = undefined;
    }
  }
}
