import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pdf-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <h2>Subir nuevo archivo para el chatbot</h2>
    <div *ngIf="currentFile">Archivo actual: {{ currentFile }}</div>
    <input type="file" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx,.xls,.xlsx">
    <button (click)="onUpload()" [disabled]="!selectedFile">Subir</button>
    <div *ngIf="error" class="error">{{ error }}</div>
    <div *ngIf="success" class="success">{{ success }}</div>
    <button (click)="goToChat()" [disabled]="!chatAvailable">Ir al chat</button>
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
    const userId = localStorage.getItem('userId') || '';
    const headers = new HttpHeaders().set('X-User-ID', userId);
    this.http.get<{chatAvailable: boolean, currentFile: string}>('http://localhost:3000/api/chat-status', { headers})
      .subscribe(
        (response) => {
          this.chatAvailable = response.chatAvailable;
          this.currentFile = response.currentFile;
        },
        (error) => {
          console.error('Error chequeando el estado del chat', error);
          this.error = 'Error al chequear el estado del chat. Intentelo más tarde';
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
      const userId = localStorage.getItem('userId') || '';
      const headers = new HttpHeaders().set('X-User-ID', userId);
      
      this.http.post<{message: string, fileId: string, fileName: string}>('http://localhost:3000/api/upload', formData, { headers })
        .subscribe(
          (response) => {
            console.log('Archivo subido exitosamente', response);
            this.success = `Archivo ${response.fileName} subido exitosamente.`;
            this.currentFile = response.fileName;
            this.chatAvailable = true;
          },
          (error: HttpErrorResponse) => {
            console.error('Error al subir un archivo', error);
            if (error.error instanceof ErrorEvent) {
              this.error = `Un error ha ocurrido: ${error.error.message}`;
            } else {
              this.error = `Servido retorno el siguiendo error ${error.status}, Mensaje de error: ${error.error.error || 'Error desconocido'}`;
            }
          }
        );
    } else {
      this.error = 'Por favor seleccione un archivo para subir.';
    }
  }

  goToChat() {
    this.router.navigate(['/chat']);
  }
}