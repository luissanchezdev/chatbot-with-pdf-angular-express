import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  template: `
    <mat-card>
      <mat-card-header class="center">
        <mat-card-title>Iniciar Sesión</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form (ngSubmit)="onSubmit()">
          <mat-form-field appearance="fill">
            <mat-label>Nombre de usuario</mat-label>
            <input matInput type="text" [(ngModel)]="username" name="username" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" [(ngModel)]="password" name="password" required>
          </mat-form-field>
          <div class="center">
            <button class="center-x" mat-raised-button color="primary" type="submit">Ingresar</button>
          </div>
        </form>
      </mat-card-content>
      <mat-card-footer class="center">
        <p *ngIf="error" class="error">{{ error }}</p>
        <p>¿No tienes una cuenta? <a mat-button color="accent" routerLink="/register">Registrarse</a></p>
      </mat-card-footer>
    </mat-card>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      margin: 100px 0px;
    }
    mat-card {
      max-width: 400px;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }
    .error {
      color: red;
      margin-top: 16px;
    }
  `]
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