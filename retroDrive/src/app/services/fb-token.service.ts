import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { FbToken } from '../models/fbToken';
import { formatDate } from '@angular/common';

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
    })
    .toPromise()
      .then(respone => {
        this.setupTokenInLocalStorage(respone);
    }).catch(error => {});
  }

  prepareRefreshToken(fbToken: FbToken): boolean {
    let result = false;
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
    const dateDiff = Date.parse(currentDate) - Date.parse(fbToken.generateDate);

    if (dateDiff > 0) {
      const dateDiffinSec = (dateDiff / 1000);
      const dateDiffinMin = (dateDiffinSec / 60);
      const tokenExpirationInMin = +fbToken.tokenExpirationInMin;
      if (dateDiffinMin >= tokenExpirationInMin) {
        this.prepareToken(fbToken.refreshToken);
        result = true;
      }
    }

    return result;
  }

  private setupTokenInLocalStorage(respone: any) {
    const tokenExpirationInSec = respone.expires_in;
    const tokenExpirationInMin = (tokenExpirationInSec / 60).toString();
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');

    const fbToken: FbToken = {
      token: respone.access_token,
      refreshToken: respone.refreshToken,
      tokenExpirationInSec,
      tokenExpirationInMin,
      generateDate: currentDate
    };

    this.localStorageService.setItem('token', fbToken);
  }
}
