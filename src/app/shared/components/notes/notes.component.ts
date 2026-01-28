import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { UserService } from "@core/services/userService";
import { ClassService } from "@core/services/classService";
import { SnackBarService } from "@core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { Note } from "@core/types/user";

export type ResourceType = 'client' | 'class' | 'instructor' | 'employee';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
  @Input() resourceType: ResourceType = 'client';
  @Input() resourceId: string = '';
  @Input() notes: Note[] | null | undefined = [];
  @Input() readOnly: boolean = false;
  @Output() notesUpdated = new EventEmitter<Note[]>();

  currentNote: string = '';
  showNotesInput = false;
  showDeleteConfirmModal = false;
  noteToDelete: Note | null = null;
  deleteConfirmButtons = [{text: 'CONTROLS.CANCEL'}, {text: 'CONTROLS.DELETE'}];

  constructor(
    private userService: UserService,
    private classService: ClassService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    if (!this.notes) {
      this.notes = [];
    }
  }

  toggleNotesInput(): void {
    this.showNotesInput = !this.showNotesInput;
    if (!this.showNotesInput) {
      this.currentNote = '';
    }
  }

  publishNote(): void {
    if (!this.currentNote.trim() || !this.resourceId || !this.resourceId.trim()) return

    if (this.resourceType === 'client' || this.resourceType === 'instructor' || this.resourceType === 'employee') {
      this.userService.addNote(this.resourceId, this.currentNote.trim()).subscribe({
        next: (updatedUser) => {
          this.notes = updatedUser.notes || [];
          this.notesUpdated.emit(this.notes);
          this.currentNote = '';
          this.showNotesInput = false;
          this.snackBarService.showSuccess(this.translateService.instant('CLIENTS.NOTE_ADDED'));
        },
        error: ({error}) => {
          this.snackBarService.showError(error.message);
        }
      });
    } else {
      this.classService.addNote(this.resourceId, this.currentNote.trim()).subscribe({
        next: (updatedClass) => {
          this.notes = updatedClass.notes || [];
          this.notesUpdated.emit(this.notes);
          this.currentNote = '';
          this.showNotesInput = false;
          this.snackBarService.showSuccess(this.translateService.instant('CLIENTS.NOTE_ADDED'));
        },
        error: ({error}) => {
          this.snackBarService.showError(error.message);
        }
      });
    }
  }

  clearNote(): void {
    this.currentNote = '';
    this.showNotesInput = false;
  }

  confirmDeleteNote(note: Note): void {
    this.noteToDelete = note;
    this.showDeleteConfirmModal = true;
  }

  processDeleteModalClick(event: { ref: NotesComponent, buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this.showDeleteConfirmModal = false;
      this.noteToDelete = null;
    } else if (event.buttonTitle === 'CONTROLS.DELETE' && this.noteToDelete && this.resourceId) {
      if (this.resourceType === 'client' || this.resourceType === 'instructor' || this.resourceType === 'employee') {
        this.userService.deleteNote(this.resourceId, this.noteToDelete._id).subscribe({
          next: (updatedUser) => {
            this.notes = updatedUser.notes || [];
            this.notesUpdated.emit(this.notes);
            this.showDeleteConfirmModal = false;
            this.noteToDelete = null;
            this.snackBarService.showSuccess(this.translateService.instant('CLIENTS.NOTE_DELETED'));
          },
          error: ({error}) => {
            this.snackBarService.showError(error.message);
          }
        });
      } else {
        this.classService.deleteNote(this.resourceId, this.noteToDelete._id).subscribe({
          next: (updatedClass) => {
            this.notes = updatedClass.notes || [];
            this.notesUpdated.emit(this.notes);
            this.showDeleteConfirmModal = false;
            this.noteToDelete = null;
            this.snackBarService.showSuccess(this.translateService.instant('CLIENTS.NOTE_DELETED'));
          },
          error: ({error}) => {
            this.snackBarService.showError(error.message);
          }
        });
      }
    }
  }

  get sortedNotes(): Note[] {
    if (!this.notes) return [];
    return [...this.notes].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  formatNoteDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
