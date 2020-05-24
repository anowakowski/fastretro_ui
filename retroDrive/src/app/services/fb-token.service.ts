import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class FbTokenService {

  constructor(private httpClient: HttpClient, private localStorageService: LocalStorageService) { }

  prepareToken(tokenToRefresh) {
    const urlForToken = 'https://securetoken.googleapis.com/v1/token?key=AIzaSyAeKbIb6hOaX8ee3GOFd5CJd9eBqpdWUZU';
    this.httpClient.post(urlForToken, {
      grant_type: 'refresh_token',
      refresh_token: tokenToRefresh
    }).toPromise().then(respone => {
      const respo = respone;
    }).catch(error => {
      const errors = error;
    });
  }

}
