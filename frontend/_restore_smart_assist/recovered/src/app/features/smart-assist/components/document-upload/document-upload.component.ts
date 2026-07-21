import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [Button],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.css',
})
export class DocumentUploadComponent {
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  @Output() readonly fileSelected = new EventEmitter<File>();

  protected busy = false;

  protected triggerFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.fileSelected.emit(file);
    input.value = '';
  }

  setBusy(busy: boolean): void {
    this.busy = busy;
  }
}
