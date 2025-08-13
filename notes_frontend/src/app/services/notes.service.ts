import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import type { Note } from '../models/note.model';

/**
/ PUBLIC_INTERFACE
 * Utility to resolve API base URL at runtime. Reads from a global variable if available,
 * otherwise defaults to '/api'.
 */
export function getApiBase(): string {
  // @ts-ignore - allow reading global configuration if present
  const runtimeCfg = (globalThis as any)?.__NOTES_API_BASE__;
  return typeof runtimeCfg === 'string' && runtimeCfg.length > 0 ? runtimeCfg : '/api';
}

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${getApiBase()}/notes`;

  // PUBLIC_INTERFACE
  /**
   * List notes from the backend with optional search query.
   * @param search optional string to search notes by title/content.
   * @returns Observable of Note array.
   */
  listNotes(search?: string): Observable<Note[]> {
    let params = new HttpParams();
    if (search && search.trim().length > 0) {
      params = params.set('q', search.trim());
    }
    return this.http.get<Note[]>(this.baseUrl, { params }).pipe(
      map((notes) =>
        notes.map((n) => ({
          ...n,
          // Ensure fields exist to avoid template errors
          title: n.title ?? '',
          content: n.content ?? '',
        }))
      )
    );
  }

  // PUBLIC_INTERFACE
  /**
   * Retrieve a single note by its ID.
   * @param id note identifier
   * @returns Observable of Note
   */
  getNote(id: string): Observable<Note> {
    return this.http.get<Note>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new note.
   * @param note Partial note with title and content at minimum.
   * @returns Observable of created Note.
   */
  createNote(note: Partial<Note>): Observable<Note> {
    return this.http.post<Note>(this.baseUrl, note);
  }

  // PUBLIC_INTERFACE
  /**
   * Update an existing note by ID.
   * @param id note identifier
   * @param note Partial fields to update
   * @returns Observable of updated Note
   */
  updateNote(id: string, note: Partial<Note>): Observable<Note> {
    return this.http.put<Note>(`${this.baseUrl}/${encodeURIComponent(id)}`, note);
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a note by ID.
   * @param id note identifier
   * @returns Observable<void>
   */
  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }
}
