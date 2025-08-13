import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.css'],
})
export class NoteEditorComponent {
  // PUBLIC_INTERFACE
  /** The note currently being edited. If `id` is undefined, a new note is being created. */
  @Input() set note(value: Note | undefined | null) {
    this._note.set(value ? { ...value } : { title: '', content: '' });
  }

  // PUBLIC_INTERFACE
  /** Save event - emits the current note state when user clicks Save. */
  @Output() save = new EventEmitter<Note>();

  // PUBLIC_INTERFACE
  /** Cancel event - emits when the user cancels editing. */
  @Output() cancel = new EventEmitter<void>();

  protected _note = signal<Note>({ title: '', content: '' });

  onSave() {
    const n = this._note();
    const toSave: Note = {
      id: n.id,
      title: (n.title || '').trim(),
      content: (n.content || '').trim(),
      starred: n.starred ?? false,
      tags: n.tags ?? [],
    };
    this.save.emit(toSave);
  }

  onCancel() {
    this.cancel.emit();
  }
}
