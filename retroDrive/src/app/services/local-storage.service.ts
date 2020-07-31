import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'secret_key';
const CURRENT_USER = 'ZkRb3yiQwcFWU#';
const CURRENT_WORKSPACE = '3ucMp!KU#Xts#';
const USER_WORKSPACE = 'K2aiKK@N9k3V2AgCTTKxNW';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  public currentUser = CURRENT_USER;
  public currentWorkspace = CURRENT_WORKSPACE;
  public userWorkspace = USER_WORKSPACE;

  getItem(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  setItem(key: string, newItem: any) {
    localStorage.setItem(key, JSON.stringify(newItem));
  }

  setEncryptedItem(key: string, newItem: any) {
    const newItemAsJSON = JSON.stringify(newItem);
    const encryptedData = CryptoJS.AES.encrypt(newItemAsJSON, SECRET_KEY);
    localStorage.setItem(key, encryptedData.toString());
  }

  getEncryptedItem(key: string): any {
    const encryptedItem = localStorage.getItem(key);
    const decryptedItem = CryptoJS.AES.decrypt(encryptedItem, SECRET_KEY);
    const itemJson = decryptedItem.toString(CryptoJS.enc.Utf8);
    const parsedItem = JSON.parse(itemJson);
    return parsedItem;
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }
}
