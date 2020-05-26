import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { FbTokenService } from './fb-token.service';
import { FbToken } from '../models/fbToken';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserApiService {

  constructor(private httpClient: HttpClient, private localStorageService: LocalStorageService, private fbTokenService: FbTokenService) { }
  baseUrl = 'https://localhost:44376/api/CurrentUsersInRetroBoard';

  getCurrentUser() {
    let token = this.localStorageService.getItem('token');
    if (this.fbTokenService.prepareRefreshToken(token)) {
      token = this.localStorageService.getItem('token');
    }

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
    let token = this.localStorageService.getItem('token');
    if (this.fbTokenService.prepareRefreshToken(token)) {
      token = this.localStorageService.getItem('token');
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    const httpOptions = {
      headers
    };

    const url = this.baseUrl + '/getCurrentUserInRetroBoard/' + retroBoardId;
    return this.httpClient.get<any>(url, httpOptions).toPromise();
  }

  addCurrentUserToRetroBoardProcess(currentUserId, currentRetroBoardId) {
    let token = this.localStorageService.getItem('token');
    if (this.fbTokenService.prepareRefreshToken(token)) {
      token = this.localStorageService.getItem('token');
    }

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
