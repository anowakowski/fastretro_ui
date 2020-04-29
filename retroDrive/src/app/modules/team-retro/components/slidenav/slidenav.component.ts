import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MatDrawer } from '@angular/material/sidenav/drawer';
import { User } from 'src/app/models/user';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { Router } from '@angular/router';

const SMALL_WIDTH_BREAKPOINT = 720;
const CURRENT_BTN_COLOR = 'warn';
const BASIC_BTN_COLOR = 'primary';
const DASHBOARD_SECTION = 'dashboard';
const EDIT_TEAMS_SECCTION = 'teams';
const RETRO_PROCES_SECCTION = 'retroProcess';


@Component({
  selector: 'app-slidenav',
  templateUrl: './slidenav.component.html',
  styleUrls: ['./slidenav.component.css']
})
export class SlidenavComponent implements OnInit {

  private mediaMatcher: MediaQueryList =
    matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px)`);

  public currentUser: User;
  public userWorkspace: UserWorkspace;

  public currentRouteSecction: string;
  public currentChosenSection: string;

  public currentColor = CURRENT_BTN_COLOR;
  public basicColor = BASIC_BTN_COLOR;
  public dashboardSection = DASHBOARD_SECTION;
  public teamsSection = EDIT_TEAMS_SECCTION;
  public retroProcessSection = RETRO_PROCES_SECCTION;

  public dashboardColor = CURRENT_BTN_COLOR;
  public teamsColor = BASIC_BTN_COLOR;
  public retroProcessColor = BASIC_BTN_COLOR;

  constructor(
    public auth: AuthService,
    private localStorageService: LocalStorageService,
    public router: Router) { }

  @ViewChild('MatDrawer', {static: true}) drawer: MatDrawer;
  ngOnInit() {
    this.currentChosenSection = DASHBOARD_SECTION;
    this.currentRouteSecction = this.router.url;

    this.setCurrentSectionByRoute();

    this.currentUser = this.localStorageService.getItem('currentUser');
    this.userWorkspace = this.localStorageService.getItem('userWorkspace');
  }

  isScreenSmall(): boolean {
    return this.mediaMatcher.matches;
  }

  reciveEditUserProfileAsCurrent() {
    this.setBtnColor(EDIT_TEAMS_SECCTION);
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
    } else if (this.currentChosenSection === EDIT_TEAMS_SECCTION) {
      this.teamsColor = BASIC_BTN_COLOR;
    } else if (this.currentChosenSection === RETRO_PROCES_SECCTION) {
      this.retroProcessColor = BASIC_BTN_COLOR;
    }
  }

  private setCurrentColor(sectionNameToCurrent: string) {
    if (sectionNameToCurrent === DASHBOARD_SECTION) {
      this.dashboardColor = CURRENT_BTN_COLOR;
    } else if (sectionNameToCurrent === EDIT_TEAMS_SECCTION) {
      this.teamsColor = CURRENT_BTN_COLOR;
    } else if (sectionNameToCurrent === RETRO_PROCES_SECCTION) {
      this.retroProcessColor = CURRENT_BTN_COLOR;
    }
  }

  private setCurrentSectionByRoute() {
    if (this.currentRouteSecction.search(EDIT_TEAMS_SECCTION) > 0) {
      this.setBtnColor(EDIT_TEAMS_SECCTION);
      return;
    } else if (this.currentRouteSecction.search('process') > 0) {
      this.setBtnColor(RETRO_PROCES_SECCTION);
    } else {
      this.setBtnColor(DASHBOARD_SECTION);
    }
  }

}
