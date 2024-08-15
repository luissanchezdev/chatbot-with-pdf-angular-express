import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <h2>Chat with Document Assistant</h2>
    <div *ngIf="!chatAvailable" class="error">
      Chat not available. Please upload a document first.
      <button (click)="goToUpload()">Go to Upload</button>
    </div>
    <div *ngIf="chatAvailable">
      <p>Current document: {{ currentFile }}</p>
      <div class="chat-container">
        <div *ngFor="let message of messages" class="message" [ngClass]="{'user': message.sender === 'user', 'assistant': message.sender === 'assistant'}">
          {{ message.text }}
        </div>
      </div>
      <input [(ngModel)]="userMessage" (keyup.enter)="sendMessage()" placeholder="Type your message...">
      <button (click)="sendMessage()">Send</button>
    </div>
    <p *ngIf="error" class="error">{{ error }}</p>
  `,
  styles: [`
    .chat-container { height: 400px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; }
    .message { margin-bottom: 10px; padding: 5px; border-radius: 5px; }
    .user { background-color: #e6f3ff; text-align: right; }
    .assistant { background-color: #f0f0f0; }
    .error { color: red; }
  `]
})
export class ChatComponent implements OnInit {
  messages: Array<{sender: string, text: string}> = [];
  userMessage = '';
  error: string | null = null;
  chatAvailable: boolean = false;
  currentFile: string | null = null;
  token: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.checkChatStatus();
    this.token = localStorage.getItem('token')
  }

  checkChatStatus() {
    this.http.get<{chatAvailable: boolean, currentFile: string}>('http://localhost:3000/api/chat-status')
      .subscribe(
        (response) => {
          this.chatAvailable = response.chatAvailable;
          this.currentFile = response.currentFile;
          if (!this.chatAvailable) {
            this.error = 'Chat not available. Please upload a document first.';
          }
        },
        (error) => {
          console.error('Error checking chat status', error);
          this.error = 'Error checking chat status. Please try again later.';
        }
      );
  }

  sendMessage(): void {
    if (this.userMessage.trim() && this.chatAvailable) {
      this.messages.push({sender: 'user', text: this.userMessage});
      
      this.http.post<{response: string}>('http://localhost:3000/api/message', { message: this.userMessage })
        .subscribe(
          (response) => {
            this.messages.push({sender: 'assistant', text: response.response});
            this.error = null;
          },
          (error) => {
            console.error('Error sending message', error);
            this.error = error.error.error || 'An error occurred while sending the message.';
          }
        );
      
      this.userMessage = '';
    }
  }

  goToUpload() {
    this.router.navigate(['/upload']);
  }
}