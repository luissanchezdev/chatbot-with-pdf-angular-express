import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" *ngIf="authService.isLoggedIn()">
      <span>{{ titleWeb }}</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/chat">
        <mat-icon>chat</mat-icon>
        Chat
      </a>
      <a mat-button *ngIf="(authService.userType$ | async) === 'company'" routerLink="/upload">
        <mat-icon>cloud_upload</mat-icon>
        Subir archivo
      </a>
      <button mat-icon-button (click)="logout()">
        <mat-icon>exit_to_app</mat-icon>
      </button>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    mat-toolbar {
      margin-bottom: 20px;
    }
  `]
})
export class AppComponent implements OnInit {
  authService: AuthService = inject(AuthService);
  titleWeb : string = 'Blaper Chat';

  constructor(private title : Title) {

  }

  ngOnInit() {
    this.title.setTitle(this.titleWeb);
  }


  logout() {
    this.authService.logout();
  }
}