import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Registro</mat-card-title>
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
          <mat-form-field appearance="fill">
            <mat-label>Tipo de usuario</mat-label>
            <mat-select [(ngModel)]="userType" name="userType" required>
              <mat-option value="client">Cliente</mat-option>
              <mat-option value="company">Empresa</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">Registrarse</button>
        </form>
      </mat-card-content>
      <mat-card-footer>
        <p *ngIf="error" class="error">{{ error }}</p>
        <p>¿Ya tienes una cuenta? <a mat-button color="accent" routerLink="/login">Iniciar sesión</a></p>
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