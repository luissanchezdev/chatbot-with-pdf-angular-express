import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userTypeSubject = new BehaviorSubject<string | null>(localStorage.getItem('userType'));
  public userType$ = this.userTypeSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3000/api/auth/login', { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userType', response.userType);
          localStorage.setItem('userId', response.userId);
          this.userTypeSubject.next(response.userType);
          this.router.navigate([response.userType === 'company' ? '/upload' : '/chat-list']);
        })
      );
  }

  register(username: string, password: string, userType: string): Observable<any> {
    return this.http.post<any>('http://localhost:3000/api/auth/register', { username, password, userType });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    this.userTypeSubject.next(null);
    this.router.navigate(['/login']);
  }

  getUserType(): string | null {
    return localStorage.getItem('userType');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}