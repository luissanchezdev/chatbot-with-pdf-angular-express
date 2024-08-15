import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HttpClientModule, 
    MatCardModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Blaper Chat</mat-card-title>
        <mat-card-subtitle *ngIf="currentFile">Documento actual: {{ currentFile }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="!chatAvailable" class="error-container">
          <p>Chat no disponible. Por favor suba un documento primero.</p>
          <button mat-raised-button color="primary" (click)="goToUpload()">Subir un archivo</button>
        </div>
        <div *ngIf="chatAvailable" class="chat-container" #chatContainer>
          <div *ngFor="let message of messages" class="message" [ngClass]="{'user': message.sender === 'user', 'assistant': message.sender === 'assistant'}">
            {{ message.text }}
          </div>
          <div *ngIf="isTyping" class="typing-indicator">
            <mat-spinner diameter="20"></mat-spinner>
            <span>Escribiendo...</span>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions *ngIf="chatAvailable">
        <mat-form-field appearance="outline" class="full-width">
          <input matInput [(ngModel)]="userMessage" (keyup.enter)="sendMessage()" placeholder="Escriba un mensaje...">
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="sendMessage()" [disabled]="!userMessage.trim()">
          <mat-icon>send</mat-icon>
          Enviar
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 800px;
      margin: 20px auto;
    }
    .chat-container {
      height: 400px;
      overflow-y: auto;
      border: 1px solid #ccc;
      padding: 10px;
      margin-bottom: 20px;
    }
    .message {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 5px;
      max-width: 70%;
    }
    .user {
      background-color: #e3f2fd;
      margin-left: auto;
    }
    .assistant {
      background-color: #f5f5f5;
    }
    .error-container {
      text-align: center;
      color: red;
    }
    .full-width {
      width: 100%;
    }
    .typing-indicator {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .typing-indicator span {
      margin-left: 10px;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  messages: Message[] = [];
  userMessage = '';
  error: string | null = null;
  chatAvailable: boolean = false;
  currentFile: string | null = null;
  token: string | null = null;
  isTyping: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.checkChatStatus();
    this.token = localStorage.getItem('token');
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  checkChatStatus() {
    const userId = localStorage.getItem('userId') || '';
    const headers = new HttpHeaders().set('X-User-ID', userId);
    this.http.get<{chatAvailable: boolean, currentFile: string}>('http://localhost:3000/api/chat-status', { headers })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log({
            responseChatStatus: response
          })
          this.chatAvailable = response.chatAvailable;
          this.currentFile = response.currentFile;
          if (!this.chatAvailable) {
            this.showSnackBar('El chat no esta disponible. Por favor suba un documento primero.', 'error');
          }
        },
        error: (error) => {
          console.error('Error chequeando el estado del chat', error);
          this.showSnackBar('Error al chequear el estado del chat. Por favor intente de nuevo más tarde.', 'error');
        }
      });
  }

  sendMessage(): void {
    if (this.userMessage.trim() && this.chatAvailable) {
      this.messages.push({sender: 'user', text: this.userMessage});
      const userId = localStorage.getItem('userId') || '';
      const headers = new HttpHeaders().set('X-User-ID', userId);
      
      this.isTyping = true;
      
      this.http.post<{response: string}>('http://localhost:3000/api/message', { message: this.userMessage }, { headers })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isTyping = false;
            this.messages.push({sender: 'assistant', text: response.response});
            this.error = null;
          },
          error: (error) => {
            this.isTyping = false;
            console.error('Error al enviar el mensaje', error);
            this.showSnackBar(error.error.error || 'Error al enviar el mensaje.', 'error');
          }
        });
      
      this.userMessage = '';
    }
  }

  goToUpload() {
    this.router.navigate(['/upload']);
  }

  showSnackBar(message: string, type: 'error' | 'warning' | 'success') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: type === 'error' ? ['error-snackbar'] : 
                  type === 'warning' ? ['warning-snackbar'] : 
                  ['success-snackbar']
    });
  }
}