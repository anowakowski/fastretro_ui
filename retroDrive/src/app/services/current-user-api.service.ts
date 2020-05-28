import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { FbTokenService } from './fb-token.service';
import { FbToken } from '../models/fbToken';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { CurrentUserInRetroBoardDataToDisplay } from '../models/CurrentUserInRetroBoardDataToDisplay';
import { CurrentUserVotes } from '../models/currentUserVotes';

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
    return this.httpClient.get<CurrentUserInRetroBoardDataToDisplay[]>(url, httpOptions).toPromise();
  }

  prepareFreshListOfCurrentUsersInRetroBoard(currentRetroBoardId: string, currentUserId: string) {
    let fbToken = this.localStorageService.getItem('token') as FbToken;
    if (this.fbTokenService.prepareRefreshToken(fbToken)) {
      fbToken = this.localStorageService.getItem('token') as FbToken;
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);
    const httpOptions = {
      headers
    };

    const url = this.baseUrl + '/prepareFreshListOfCurrentUsers/';
    const postData = {
      retroBoardId: currentRetroBoardId,
      userId: currentUserId,
    };
    return this.httpClient.post(url, postData, httpOptions).toPromise();
  }

  addCurrentUserToRetroBoardProcess(currentUser: User, currentRetroBoardId) {
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
      userId: currentUser.uid,
      chosenAvatarUrl: currentUser.chosenAvatarUrl,
      displayName: currentUser.displayName
    };
    return this.httpClient.post(url, postData, httpOptions).toPromise();
  }

  addUserVoteOnCard(userId: string, retroBoardId: string, retroBoardCardId: string) {
    const url = this.baseUrl + '/setUserVote/';

    const postData = {
      retroBoardId,
      userId,
      retroBoardCardId
    };

    return this.httpClient.post(url, postData, this.prepareCurrentHttpOptions()).toPromise();
  }

  removeCurrentUserVote(retroBoardCardId: string, userId: string, retroBoardId: string) {
    const url = this.baseUrl + '/removeUserVote/';

    const postData = {
      retroBoardId,
      userId,
      retroBoardCardId
    };

    return this.httpClient.post(url, postData, this.prepareCurrentHttpOptions()).toPromise();
  }

  getUsersVote(retroBoardId: string) {
    const url = this.baseUrl + '/getUsersVote/' + retroBoardId;
    return this.httpClient.get<CurrentUserVotes[]>(url, this.prepareCurrentHttpOptions()).toPromise();
  }

  getUserVoteCount(userId: string, retroBoardId: string) {
    const url = this.baseUrl + '/getUserVoteCount/' + retroBoardId + '/' + userId;
    return this.httpClient.get<number>(url, this.prepareCurrentHttpOptions()).toPromise();
  }

  private prepareCurrentHttpOptions() {
    let fbToken = this.localStorageService.getItem('token') as FbToken;
    if (this.fbTokenService.prepareRefreshToken(fbToken)) {
      fbToken = this.localStorageService.getItem('token') as FbToken;
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);

    const httpOptions = {
      headers
    };

    return httpOptions;
  }
}
