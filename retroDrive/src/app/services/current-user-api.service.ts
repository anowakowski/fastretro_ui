import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { FbTokenService } from './fb-token.service';
import { FbToken } from '../models/fbToken';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { CurrentUserInRetroBoardDataToDisplay } from '../models/CurrentUserInRetroBoardDataToDisplay';
import { CurrentUserVotes } from '../models/currentUserVotes';
import { RetroBoardOptions } from '../models/retroBoardOptions';
import { RetroBoardAdditionalInfoToSave } from '../models/retroBoardAdditionalInfoToSave';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserApiService {



  constructor(private httpClient: HttpClient, private localStorageService: LocalStorageService, private fbTokenService: FbTokenService) { }

  baseUrl = environment.apiUrl + 'api/CurrentUsersInRetroBoard';

  getCurrentUserInRetroBoard(retroBoardId) {
    let fbToken = this.localStorageService.getItem('token') as FbToken;
    if (this.fbTokenService.isTokenExpired(fbToken)) {
      fbToken = this.localStorageService.getItem('token') as FbToken;
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);

    const httpOptions = {
      headers
    };

    const url = this.baseUrl + '/getCurrentUserInRetroBoard/' + retroBoardId;
    return this.httpClient.get<CurrentUserInRetroBoardDataToDisplay[]>(url, httpOptions).toPromise();
  }

  getRetroBoardOptions(retroBoardId: string) {
    let fbToken = this.localStorageService.getItem('token') as FbToken;
    if (this.fbTokenService.isTokenExpired(fbToken)) {
      fbToken = this.localStorageService.getItem('token') as FbToken;
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);

    const httpOptions = {
      headers
    };

    const url = this.baseUrl + '/getRetroBoardOptions/' + retroBoardId;
    return this.httpClient.get<RetroBoardOptions>(url, httpOptions).toPromise();
  }

  getPreviousRetroBoardId(retroBoardId: string, workspaceId: string, teamId: string) {
    const fbToken = this.localStorageService.getItem('token') as FbToken;
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);

    const httpOptions = {
      headers
    };

    const url = this.baseUrl + '/getPreviousIdOfRetroBoard/' + retroBoardId + '/' + workspaceId + '/' + teamId;
    return this.httpClient.get<any>(url, httpOptions).toPromise();
  }

  getUsersInTeam(workspaceFirebaseDocId: string, teamFirebaseDocId: string) {
    const fbToken = this.localStorageService.getItem('token') as FbToken;
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);

    const httpOptions = {
      headers
    };

    const url = this.baseUrl + '/GetUsersInTeam/' + workspaceFirebaseDocId + '/' + teamFirebaseDocId;
    return this.httpClient.get<any>(url, httpOptions).toPromise();
  }

  prepareFreshListOfCurrentUsersInRetroBoard(currentRetroBoardId: string, currentUserId: string) {
    const fbToken = this.localStorageService.getItem('token') as FbToken;

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
    const fbToken = this.localStorageService.getItem('token') as FbToken;
    return this.GetAddCurrentUserResponse(fbToken, currentRetroBoardId, currentUser);
  }

  setRetroBoardOptions(retroBoardOptionsToSave: RetroBoardOptions) {
    const fbToken = this.localStorageService.getItem('token') as FbToken;
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);
    const httpOptions = {
      headers
    };
    const url = this.baseUrl + '/setRetroBoardOptions/';

    return this.httpClient.post(url, retroBoardOptionsToSave, httpOptions).toPromise();
  }

  setUserInTeam(userFirebaseDocId, teamFirebaseDocId, workspaceFirebaseDocId, chosenAvatarUrl, displayName) {
    const fbToken = this.localStorageService.getItem('token') as FbToken;
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);
    const httpOptions = {
      headers
    };
    const url = this.baseUrl + '/setUserInTeam/';

    const dataToPost = {
      userFirebaseDocId,
      teamFirebaseDocId,
      workspaceFirebaseDocId,
      chosenAvatarUrl,
      displayName
    };

    return this.httpClient.post(url, dataToPost, httpOptions).toPromise();
  }

  setRetroBoardAdditionalInfo(retroBoardAdditionalInfo: RetroBoardAdditionalInfoToSave) {
    const fbToken = this.localStorageService.getItem('token') as FbToken;
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);
    const httpOptions = {
      headers
    };
    const url = this.baseUrl + '/setRetroBoardAdditionalInfo/';

    return this.httpClient.post(url, retroBoardAdditionalInfo, httpOptions).toPromise();
  }

  addRetroBoardAdditionalInfoWithActionCount(
    actionsCount: number,
    retroBoardAdditionalInfo: RetroBoardAdditionalInfoToSave) {
      const fbToken = this.localStorageService.getItem('token') as FbToken;
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);
      const httpOptions = {
        headers
      };
      const url = this.baseUrl + '/setRetroBoardAdditionalInfoWithActionCount/';

      const dataToPost = {
        actionsCount,
        retroBoardFirebaseDocId: retroBoardAdditionalInfo.retroBoardFirebaseDocId,
        teamFirebaseDocId: retroBoardAdditionalInfo.teamFirebaseDocId,
        workspaceFirebaseDocId: retroBoardAdditionalInfo.workspaceFirebaseDocId
      };

      return this.httpClient.post(url, dataToPost, httpOptions).toPromise();
  }

  isTokenExpired() {
    const fbToken = this.localStorageService.getItem('token') as FbToken;
    return this.fbTokenService.isTokenExpired(fbToken);
  }

  regeneraTokenPromise() {
    const fbToken = this.localStorageService.getItem('token') as FbToken;
    return this.fbTokenService.prepareTokenPromise(fbToken.refreshToken);
  }

  setRegeneratedToken(refreshedTokenResponse) {
    this.fbTokenService.setupTokenInLocalStorage(refreshedTokenResponse);
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

  removeCurrentUserVoteForMerge(retroBoardCardId: string, userId: string, retroBoardId: string, voutCountToRemove: number) {
    const url = this.baseUrl + '/removeUserVoteWhenMergedCard/';

    const postData = {
      retroBoardCardId,
      retroBoardId,
      userId,
      voutCountToRemove
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

  private GetAddCurrentUserResponse(fbToken: FbToken, currentRetroBoardId: any, currentUser: User) {
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

  private prepareCurrentHttpOptions() {
    let fbToken = this.localStorageService.getItem('token') as FbToken;
    if (this.fbTokenService.isTokenExpired(fbToken)) {
      this.fbTokenService.prepareToken(fbToken.refreshToken);
      fbToken = this.localStorageService.getItem('token') as FbToken;
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + fbToken.token);

    const httpOptions = {
      headers
    };

    return httpOptions;
  }
}
