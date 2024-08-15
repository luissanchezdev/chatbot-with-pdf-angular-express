import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <nav *ngIf="authService.isLoggedIn()">
      <a routerLink="/chat">Chat</a>
      <a *ngIf="(authService.userType$ | async) === 'company'" routerLink="/upload">Subir archivo</a>
      <button (click)="logout()">Cerrar sesión</button>
    </nav>
    <router-outlet></router-outlet>
  `,
  styles: [`
    nav { padding: 10px; background-color: #f0f0f0; }
    nav a { margin-right: 10px; }
  `]
})
export class AppComponent {
  authService: AuthService = inject(AuthService);

  constructor() {}

  logout() {
    this.authService.logout();
  }
}