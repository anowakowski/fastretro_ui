import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'secret_key';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

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
