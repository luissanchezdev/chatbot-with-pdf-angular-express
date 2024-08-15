import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Registro</h2>
    <form (ngSubmit)="onSubmit()">
      <div>
        <label for="username">Nombre de usuario:</label>
        <input type="text" id="username" [(ngModel)]="username" name="username" required>
      </div>
      <div>
        <label for="password">Contraseña:</label>
        <input type="password" id="password" [(ngModel)]="password" name="password" required>
      </div>
      <div>
        <label for="userType">Tipo de usuario:</label>
        <select id="userType" [(ngModel)]="userType" name="userType" required>
          <option value="client">Cliente</option>
          <option value="company">Empresa</option>
        </select>
      </div>
      <button type="submit">Registrarse</button>
    </form>
    <p *ngIf="error" class="error">{{ error }}</p>
    <p>¿Ya tienes una cuenta? <a routerLink="/login">Iniciar sesión</a></p>
  `,
  styles: [
    `form { display: flex; flex-direction: column; max-width: 300px; margin: auto; }`,
    `input, select { margin-bottom: 10px; }`,
    `.error { color: red; }`
  ]
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  userType: string = 'client';
  error: string | null = null;

  private authService: AuthService = inject(AuthService);

  constructor(private router: Router) {}

  onSubmit() {
    this.authService.register(this.username, this.password, this.userType).subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      (error) => {
        this.error = error.error.error || 'Un error ha ocurrido durante el registro';
      }
    );
  }
}