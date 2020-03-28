import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-new-user-wizard',
  templateUrl: './new-user-wizard.component.html',
  styleUrls: ['./new-user-wizard.component.css']
})
export class NewUserWizardComponent implements OnInit {
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thrFormGroup: FormGroup;

  avatars: Array<string>;

  avatar1MainPhotoUrl = 'https://robohash.org/PC1.png?set=set2';
  avatar2MainPhotoUrl = 'https://robohash.org/PC2.png?set=set2';
  avatar3MainPhotoUrl = 'https://robohash.org/PC3.png?set=set2';
  avatar4MainPhotoUrl = 'https://robohash.org/PC4.png?set=set2';
  avatar5MainPhotoUrl = 'https://robohash.org/PC5.png?set=set2';

  checked = false;
  currentUser: User;

  constructor(
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');

    this.avatars = new Array<string>();

    this.avatars.push('https://robohash.org/PC1.png?set=set2');
    this.avatars.push('https://robohash.org/PC2.png?set=set2');
    this.avatars.push('https://robohash.org/PC3.png?set=set2');
    this.avatars.push('https://robohash.org/PC4.png?set=set2');
    this.avatars.push('https://robohash.org/PC5.png?set=set2');
    this.avatars.push(this.currentUser.photoURL);

    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thrFormGroup = this.formBuilder.group({
      thrCtrl: ['', Validators.required]
    });
  }

  getUrl(avatar) {
    return avatar;
  }

}
