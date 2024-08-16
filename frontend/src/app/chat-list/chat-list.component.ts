import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatListService } from '../chat-list.service';
import { Company } from '../interfaces/Company';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatListModule, MatIconModule],
  template: `
    <mat-list>
      <mat-list-item *ngFor="let company of listCompanies">
        <button mat-raised-button color="primary" (click)="navigateToChat(company.username)">
          <mat-icon>{{ company.current_file_name }}</mat-icon>
          {{ company.username }}
        </button>
      </mat-list-item>
    </mat-list>
  `,
  styles: [`
    mat-list-item {
      margin-bottom: 8px;
    }
    button {
      width: 100%;
      text-align: left;
    }
  `]
})
export class ChatListComponent implements OnInit {
  private chatListService: ChatListService = inject(ChatListService);
  private router: Router = inject(Router);
  listCompanies: Company[] = [];
  
  ngOnInit() {
    this.getAllCompanies();
  }

  getAllCompanies() {
    this.chatListService.getChatList()
      .subscribe(companies => {
        this.listCompanies = companies;
      });
  }

  navigateToChat(companyId: string) {
    this.router.navigate(['/chat', companyId]);
  }
}