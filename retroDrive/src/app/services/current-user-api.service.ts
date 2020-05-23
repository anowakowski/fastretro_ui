import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserApiService {

  constructor(private httpClient: HttpClient, private localStorageService: LocalStorageService) { }
  baseUrl = 'https://localhost:44376/api/CurrentUsersInRetroBoard/1/retroBoards/2/users';

  getCurrentUser() {
    const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImY1YzlhZWJlMjM0ZGE2MDE2YmQ3Yjk0OTE2OGI4Y2Q1YjRlYzllZWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZmFzdHJldHJvLTY0YWRlIiwiYXVkIjoiZmFzdHJldHJvLTY0YWRlIiwiYXV0aF90aW1lIjoxNTkwMDcxNzA3LCJ1c2VyX2lkIjoieExXRlB5b2JZMVljbFBTY2dFclJPZ0hWc0dXMiIsInN1YiI6InhMV0ZQeW9iWTFZY2xQU2NnRXJST2dIVnNHVzIiLCJpYXQiOjE1OTAwNzE3MDcsImV4cCI6MTU5MDA3NTMwNywiZW1haWwiOiJ1c2VyZm9ydGVzdEBlbWwuY2MiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidXNlcmZvcnRlc3RAZW1sLmNjIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.nMUZRvu9hgq-qKPn3ydxwbuF9IeoqoVdvJwahL6tZ9LYYfftO2JAIgFcYCgpI6tdg3wFKJBvgfu5v5wpKJZRmXUg7dyWRjzXUJ5NGCjrkrCYcjp14Fc88nls2yqmPCueTwQ97vdfk428dtGGtmBRGo_kN0yV7gJSh35z_v17-_x1Fln4braEhG9aAGsWHGJfNvsf9ffG-VhyGhlZS5tgq2bE9czTVP39HTC51fDgQDLwa2Z-9smqUdmF4F_IFnAUjGEcwCkKi7cBPnO7uLkTe_mF1meRV-Kv1NzJeyJPi-PuJ4EE1UaYjR4YF769lSam04G0qVrafD4hjldfD5DeZg';
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
}
