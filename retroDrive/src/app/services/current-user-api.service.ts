import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserApiService {

  constructor(private httpClient: HttpClient) { }
  baseUrl = 'http://localhost:5000/api/';

  getCurrentUser() {

  }
}
