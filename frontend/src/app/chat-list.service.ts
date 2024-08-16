import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Company } from './interfaces/Company';

@Injectable({
  providedIn: 'root'
})
export class ChatListService {

  private http : HttpClient = inject(HttpClient);

  constructor() { }

  getChatList() {
    return this.http.get<Company[]>('http://localhost:3000/api/chat-list')
  }
}
