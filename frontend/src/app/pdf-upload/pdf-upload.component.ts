import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pdf-upload',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Subir nuevo archivo para el chatbot</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="currentFile">Archivo actual: {{ currentFile }}</div>
        <input type="file" #fileInput style="display: none" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx,.xls,.xlsx">
        <button mat-raised-button color="primary" (click)="fileInput.click()">
          <mat-icon>attach_file</mat-icon>
          Seleccionar archivo
        </button>
        <span *ngIf="selectedFile"> {{ selectedFile.name }} </span>
        <mat-progress-bar *ngIf="uploading" mode="indeterminate"></mat-progress-bar>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="accent" (click)="onUpload()" [disabled]="!selectedFile || uploading">Subir</button>
        <button mat-raised-button color="primary" (click)="goToChat()" [disabled]="!chatAvailable">Ir al chat</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 400px;
      margin: 2em auto;
      text-align: center;
    }
    mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    button {
      margin: 1em 0;
    }
  `]
})
export class PdfUploadComponent implements OnInit {
  selectedFile: File | null = null;
  uploading: boolean = false;
  chatAvailable: boolean = false;
  currentFile: string | null = null;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

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
          this.showSnackBar('Error al chequear el estado del chat. Inténtelo más tarde', 'error');
        }
      );
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }

  onUpload(): void {
    if (this.selectedFile) {
      this.uploading = true;
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);
      const userId = localStorage.getItem('userId') || '';
      const headers = new HttpHeaders().set('X-User-ID', userId);
      
      this.http.post<{message: string, fileId: string, fileName: string}>('http://localhost:3000/api/upload', formData, { headers })
        .subscribe(
          (response) => {
            console.log('Archivo subido exitosamente', response);
            this.showSnackBar(`Archivo ${response.fileName} subido exitosamente.`, 'success');
            this.currentFile = response.fileName;
            this.chatAvailable = true;
            this.uploading = false;
          },
          (error: HttpErrorResponse) => {
            console.error('Error al subir un archivo', error);
            this.uploading = false;
            if (error.error instanceof ErrorEvent) {
              this.showSnackBar(`Un error ha ocurrido: ${error.error.message}`, 'error');
            } else {
              this.showSnackBar(`Servidor retornó el siguiente error ${error.status}, Mensaje de error: ${error.error.error || 'Error desconocido'}`, 'error');
            }
          }
        );
    } else {
      this.showSnackBar('Por favor seleccione un archivo para subir.', 'warning');
    }
  }

  goToChat() {
    this.router.navigate(['/chat']);
  }

  showSnackBar(message: string, type: 'success' | 'error' | 'warning') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: type === 'error' ? ['error-snackbar'] : 
                  type === 'warning' ? ['warning-snackbar'] : 
                  ['success-snackbar']
    });
  }
}