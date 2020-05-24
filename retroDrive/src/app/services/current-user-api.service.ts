import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserApiService {

  constructor(private httpClient: HttpClient, private localStorageService: LocalStorageService) { }
  baseUrl = 'https://localhost:44376/api/CurrentUsersInRetroBoard';

  getCurrentUser() {
    const token = this.localStorageService.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    const httpOptions = {
      headers
    };

    const url = this.baseUrl;
    return this.httpClient.get<any>(url, httpOptions).toPromise().then(response => {
      const resp = response;
    }).catch(error => {
      const err = error;
    });
  }

  getCurrentUserInRetroBoard(retroBoardId) {
    const token = this.localStorageService.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    const httpOptions = {
      headers
    };

    const url = this.baseUrl + '/getCurrentUserInRetroBoard/' + retroBoardId;
    return this.httpClient.get<any>(url, httpOptions).toPromise();
  }

  addCurrentUserToRetroBoardProcess(currentUserId, currentRetroBoardId) {
    const token = this.localStorageService.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    const httpOptions = {
      headers
    };

    const url = 'https://localhost:44376/api/CurrentUsersInRetroBoard/setCurrentUser/';
    const postData = {
      retroBoardId: currentRetroBoardId,
      userId: currentUserId
    };
    return this.httpClient.post(url, postData, httpOptions).toPromise();
  }
}
