import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pdf-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <h2>Upload Document</h2>
    <div *ngIf="currentFile">Current file: {{ currentFile }}</div>
    <input type="file" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx,.xls,.xlsx">
    <button (click)="onUpload()" [disabled]="!selectedFile">Upload</button>
    <div *ngIf="error" class="error">{{ error }}</div>
    <div *ngIf="success" class="success">{{ success }}</div>
    <button (click)="goToChat()" [disabled]="!chatAvailable">Go to Chat</button>
  `,
  styles: [
    `.error { color: red; margin-top: 10px; }`,
    `.success { color: green; margin-top: 10px; }`
  ]
})
export class PdfUploadComponent implements OnInit {
  selectedFile: File | null = null;
  error: string | null = null;
  success: string | null = null;
  chatAvailable: boolean = false;
  currentFile: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.checkChatStatus();
  }

  checkChatStatus() {
    this.http.get<{chatAvailable: boolean, currentFile: string}>('http://localhost:3000/api/chat-status')
      .subscribe(
        (response) => {
          this.chatAvailable = response.chatAvailable;
          this.currentFile = response.currentFile;
        },
        (error) => {
          console.error('Error checking chat status', error);
          this.error = 'Error checking chat status. Please try again later.';
        }
      );
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
    this.error = null;
    this.success = null;
  }

  onUpload(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);
      
      this.http.post<{message: string, fileId: string, fileName: string}>('http://localhost:3000/api/upload', formData)
        .subscribe(
          (response) => {
            console.log('File uploaded successfully', response);
            this.success = `File ${response.fileName} uploaded successfully.`;
            this.currentFile = response.fileName;
            this.chatAvailable = true;
          },
          (error: HttpErrorResponse) => {
            console.error('Error uploading file', error);
            if (error.error instanceof ErrorEvent) {
              this.error = `An error occurred: ${error.error.message}`;
            } else {
              this.error = `Server returned code ${error.status}, error message: ${error.error.error || 'Unknown error'}`;
            }
          }
        );
    } else {
      this.error = 'Please select a file to upload.';
    }
  }

  goToChat() {
    this.router.navigate(['/chat']);
  }
}