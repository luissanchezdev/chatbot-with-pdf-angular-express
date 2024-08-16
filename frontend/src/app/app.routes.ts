import { Routes } from '@angular/router';
import { PdfUploadComponent } from './pdf-upload/pdf-upload.component';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './auth.guard';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatUserComponent } from './chat-user/chat-user.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'upload', component: PdfUploadComponent, canActivate: [AuthGuard], data: { roles: ['company'] } },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard], data: { roles: ['company'] } },
  { path: 'chat-list', component: ChatListComponent, canActivate: [AuthGuard], data: { roles: ['client'] } },
  { path: 'chat/:nameCompany', component: ChatUserComponent, canActivate: [AuthGuard], data: { roles: ['client'] } },
];