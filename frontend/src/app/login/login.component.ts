import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Login</h2>
    <form (ngSubmit)="onSubmit()">
      <div>
        <label for="username">Nombre de usuario:</label>
        <input type="text" id="username" [(ngModel)]="username" name="username" required>
      </div>
      <div>
        <label for="password">Contraseña:</label>
        <input type="password" id="password" [(ngModel)]="password" name="password" required>
      </div>
      <button type="submit">Ingresar</button>
    </form>
    <p *ngIf="error" class="error">{{ error }}</p>
    <p>¿No tienes una cuenta? <a routerLink="/register">Registrarse</a></p>
  `,
  styles: [
    `form { display: flex; flex-direction: column; max-width: 300px; margin: auto; }`,
    `input { margin-bottom: 10px; }`,
    `.error { color: red; }`
  ]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string | null = null;

  private authService: AuthService = inject(AuthService);

  constructor(private router: Router) {}

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe(
      () => {
        // Navigation is handled in the AuthService
      },
      (error : any) => {
        this.error = error.error.error || 'Ha ocurrido un error durante el inicio de sesión.';
      }
    );
  }
}