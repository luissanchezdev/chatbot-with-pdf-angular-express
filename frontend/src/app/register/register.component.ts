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
    <h2>Register</h2>
    <form (ngSubmit)="onSubmit()">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" [(ngModel)]="username" name="username" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" [(ngModel)]="password" name="password" required>
      </div>
      <div>
        <label for="userType">User Type:</label>
        <select id="userType" [(ngModel)]="userType" name="userType" required>
          <option value="client">Client</option>
          <option value="company">Company</option>
        </select>
      </div>
      <button type="submit">Register</button>
    </form>
    <p *ngIf="error" class="error">{{ error }}</p>
    <p>Already have an account? <a routerLink="/login">Login</a></p>
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
        this.error = error.error.error || 'An error occurred during registration.';
      }
    );
  }
}