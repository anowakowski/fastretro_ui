import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MatDrawer } from '@angular/material/sidenav/drawer';

const SMALL_WIDTH_BREAKPOINT = 720;
const CURRENT_BTN_COLOR = 'warn';
const BASIC_BTN_COLOR = 'primary';
const DASHBOARD_SECTION = 'dashboard';
const EDIT_USERPROFILE_SECCTION = 'editUserProfile';


@Component({
  selector: 'app-slidenav',
  templateUrl: './slidenav.component.html',
  styleUrls: ['./slidenav.component.css']
})
export class SlidenavComponent implements OnInit {

  private mediaMatcher: MediaQueryList =
    matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px)`);


  public currentRouteSecction: string;
  public currentChosenSection: string;

  public currentColor = CURRENT_BTN_COLOR;
  public basicColor = BASIC_BTN_COLOR;
  public dashboardSection = DASHBOARD_SECTION;
  public userprofileSection = EDIT_USERPROFILE_SECCTION;

  public dashboardColor = CURRENT_BTN_COLOR;
  public userProfileColor = BASIC_BTN_COLOR;

  constructor() { }
  @ViewChild('MatDrawer', {static: true}) drawer: MatDrawer;
  ngOnInit() {
  }

  isScreenSmall(): boolean {
    return this.mediaMatcher.matches;
  }

  reciveEditUserProfileAsCurrent() {
    this.setBtnColor(EDIT_USERPROFILE_SECCTION);
  }

  reciveDashboardAsCurrent() {
    this.setBtnColor(DASHBOARD_SECTION);
  }

  setBtnColor(sectionNameToCurrent: string) {
    if (sectionNameToCurrent === this.currentChosenSection) {
      return;
    }
    this.setCurrentColor(sectionNameToCurrent);
    this.setBasicColor();

    this.currentChosenSection = sectionNameToCurrent;
  }

  private setBasicColor() {
    if (this.currentChosenSection === DASHBOARD_SECTION) {
      this.dashboardColor = BASIC_BTN_COLOR;
    } else if (this.currentChosenSection === EDIT_USERPROFILE_SECCTION) {
      this.userProfileColor = BASIC_BTN_COLOR;
    }
  }

  private setCurrentColor(sectionNameToCurrent: string) {
    if (sectionNameToCurrent === DASHBOARD_SECTION) {
      this.dashboardColor = CURRENT_BTN_COLOR;
    } else if (sectionNameToCurrent === EDIT_USERPROFILE_SECCTION) {
      this.userProfileColor = CURRENT_BTN_COLOR;
    }
  }

  private setCurrentSectionByRoute() {
    if (this.currentRouteSecction.search(EDIT_USERPROFILE_SECCTION) === 1) {
      this.setBtnColor(EDIT_USERPROFILE_SECCTION);
      return;
    }
    this.setBtnColor(DASHBOARD_SECTION);
  }

}
