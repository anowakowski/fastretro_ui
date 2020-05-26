import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { FbTokenService } from './fb-token.service';
import { FbToken } from '../models/fbToken';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserApiService {

  constructor(private httpClient: HttpClient, private localStorageService: LocalStorageService, private fbTokenService: FbTokenService) { }

  baseUrl = environment.apiUrl + 'api/CurrentUsersInRetroBoard';

  getCurrentUserInRetroBoard(retroBoardId) {
    let fbToken = this.localStorageService.getItem('token') as FbToken;
    if (this.fbTokenService.prepareRefreshToken(fbToken)) {
      fbToken = this.localStorageService.getItem('token') as FbToken;
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);

    const httpOptions = {
      headers
    };

    const url = this.baseUrl + '/getCurrentUserInRetroBoard/' + retroBoardId;
    return this.httpClient.get<any>(url, httpOptions).toPromise();
  }

  addCurrentUserToRetroBoardProcess(currentUserId, currentRetroBoardId) {
    let fbToken = this.localStorageService.getItem('token') as FbToken;
    if (this.fbTokenService.prepareRefreshToken(fbToken)) {
      fbToken = this.localStorageService.getItem('token') as FbToken;
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);

    const httpOptions = {
      headers
    };

    const url = this.baseUrl + '/setCurrentUser/';
    const postData = {
      retroBoardId: currentRetroBoardId,
      userId: currentUserId
    };
    return this.httpClient.post(url, postData, httpOptions).toPromise();
  }
}
