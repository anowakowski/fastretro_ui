import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

const CURRENT_USER = 'ZkRb3yiQwcFWU#';
const CURRENT_WORKSPACE = '3ucMp!KU#Xts#';
const USER_WORKSPACE = 'K2aiKK@N9k3V2AgCTTKxNW';
const TOKEN = 'Sa@LRm*Dc6mmKkyiu';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {
   this.x_da = environment.x_data;
  }

  // tslint:disable-next-line:variable-name
  private x_da: string;
  public currentUserKey  = CURRENT_USER;
  public currentWorkspaceKey = CURRENT_WORKSPACE;
  public userWorkspaceKey = USER_WORKSPACE;
  public tokenKey = TOKEN;

  getItem(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  setItem(key: string, newItem: any) {
    localStorage.setItem(key, JSON.stringify(newItem));
  }

  setEncryptedItem(key: string, newItem: any) {
    const newItemAsJSON = JSON.stringify(newItem);
    const encryptedData = CryptoJS.AES.encrypt(newItemAsJSON, this.x_da);
    localStorage.setItem(key, encryptedData.toString());
  }

  getDecryptedItem(key: string): any {
    const encryptedItem = localStorage.getItem(key);
    const decryptedItem = CryptoJS.AES.decrypt(encryptedItem, this.x_da);
    const itemJson = decryptedItem.toString(CryptoJS.enc.Utf8);
    const parsedItem = JSON.parse(itemJson);
    return parsedItem;
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }
}
