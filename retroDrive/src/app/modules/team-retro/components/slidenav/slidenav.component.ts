import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MatDrawer } from '@angular/material/sidenav/drawer';
import { User } from 'src/app/models/user';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { Router } from '@angular/router';
import { EventsService } from 'src/app/services/events.service';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { UserSettings } from 'src/app/models/UserSettings';

import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs/internal/Subscription';


const SMALL_WIDTH_BREAKPOINT = 970;
const CURRENT_BTN_COLOR = 'warn';
const BASIC_BTN_COLOR = 'primary';
const DASHBOARD_SECTION = 'dashboard';
const EDIT_TEAMS_SECCTION = 'teams';
const RETRO_PROCES_SECCTION = 'retroProcess';
// tslint:disable-next-line:variable-name
const All_RETROBOARDS_LIST_SECTION = 'allRetroboardList';
const ALL_NOTIFICATIONS_SECTION = 'all-your-notifications';


@Component({
  selector: 'app-slidenav',
  templateUrl: './slidenav.component.html',
  styleUrls: ['./slidenav.component.css']
})
export class SlidenavComponent implements OnInit, OnDestroy {

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
  public allRetroBoardListSection = All_RETROBOARDS_LIST_SECTION;
  public allNotificationsSection = ALL_NOTIFICATIONS_SECTION;

  public dashboardColor = CURRENT_BTN_COLOR;
  public teamsColor = BASIC_BTN_COLOR;
  public retroProcessColor = BASIC_BTN_COLOR;
  public allRetroBoardListColor = BASIC_BTN_COLOR;
  public allNotificationsColor = BASIC_BTN_COLOR;

  setNewTeamsSubscription: any;
  setRetroProcessSubscription: any;
  goOutFromAllRetroBoardSubscription: any;
  setMoreHigherForBackgroundSubscription: any;
  setNoMoreHigherForBackgroundSubscription: any;
  setAllRetroBoardsListSubscription: any;
  setAllNotificationSectionSubscription: any;
  shouldRefreshUserSettingsSubscription: any;

  shouldCloseSlidenav = false;
  shouldShowMoreHigherOnAllRetroBoardList = false;
  shouldShowNotificationSection: boolean;
  userSettings: UserSettings;

  mediaSub: Subscription;
  devicesXs: boolean;
  devicesSm: boolean;
  devicesMd: boolean;
  devicesLg: boolean;

  constructor(
    public auth: AuthService,
    private localStorageService: LocalStorageService,
    public router: Router,
    private eventService: EventsService,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    public mediaObserver: MediaObserver) { }


  @ViewChild('MatDrawer', {static: true}) drawer: MatDrawer;
  ngOnInit() {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.devicesXs = result.mqAlias === 'xs' ? true : false;
      this.devicesSm = result.mqAlias === 'sm' ? true : false;
      this.devicesMd = result.mqAlias === 'md' ? true : false;
      this.devicesLg = result.mqAlias === 'lg' ? true : false;
    });
    this.currentChosenSection = DASHBOARD_SECTION;
    this.currentRouteSecction = this.router.url;

    this.currentUser = this.localStorageService.getDecryptedItem(this.localStorageService.currentUserKey);

    if (this.currentUser === undefined) {
      this.auth.signOut();
    } else {
      if (!this.currentUser.isNewUser) {
        this.userWorkspace = this.localStorageService.getDecryptedItem(this.localStorageService.userWorkspaceKey);
      }
    }

    this.setCurrentSectionByRoute();
    this.subscribeEvents();
    this.getUserNotificationToCheckIfAnyExists();

    this.getUserSettings();
  }

  ngOnDestroy() {
    this.setNewTeamsSubscription.unsubscribe();
    this.setRetroProcessSubscription.unsubscribe();
    this.goOutFromAllRetroBoardSubscription.unsubscribe();
    this.shouldRefreshUserSettingsSubscription.unsubscribe();

    this.mediaSub.unsubscribe();
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
    this.setSlidenavPosition(sectionNameToCurrent);

    this.currentChosenSection = sectionNameToCurrent;
  }

  setSlidenavPosition(sectionNameToCurrent: string) {
    if (sectionNameToCurrent === All_RETROBOARDS_LIST_SECTION || sectionNameToCurrent === ALL_NOTIFICATIONS_SECTION) {
      this.shouldCloseSlidenav = true;
    } else {
      this.shouldCloseSlidenav = false;
    }
  }

  getUserNotificationToCheckIfAnyExists() {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.getUserNotyficationFromApi();
      });
    } else {
      this.getUserNotyficationFromApi();
    }
  }

  isSectionWithGreyedBackground() {
    return this.currentChosenSection === this.allRetroBoardListSection || this.currentChosenSection === this.allNotificationsSection;
  }

  private getUserNotyficationFromApi() {
    this.currentUserInRetroBoardApiService.getUserNotification(this.currentUser.uid)
      .then(response => {
        if (response !== undefined && response !== null) {
          if (response.userNotificationWorkspaceWithRequiredAccessResponses.length > 0 ||
              response.userNotificationWorkspaceWithRequiredAccesses.length > 0) {
                this.shouldShowNotificationSection = true;
          }
        }
      })
      .catch(error => {
        const err = error;
      });
  }

  private getUserSettingsFromApi() {
    this.currentUserInRetroBoardApiService.getUserSettings(this.currentUser.uid)
      .then(response => {
        this.userSettings = response;
      });
  }

  private getUserSettings() {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.getUserSettingsFromApi();
      });
    } else {
      this.getUserSettingsFromApi();
    }
  }

  private setBasicColor() {
    if (this.currentChosenSection === DASHBOARD_SECTION) {
      this.dashboardColor = BASIC_BTN_COLOR;
    } else if (this.currentChosenSection === EDIT_TEAMS_SECCTION) {
      this.teamsColor = BASIC_BTN_COLOR;
    } else if (this.currentChosenSection === RETRO_PROCES_SECCTION) {
      this.retroProcessColor = BASIC_BTN_COLOR;
    } else if (this.currentChosenSection === All_RETROBOARDS_LIST_SECTION) {
      this.allRetroBoardListColor = BASIC_BTN_COLOR;
    } else if (this.currentChosenSection === ALL_NOTIFICATIONS_SECTION) {
      this.allNotificationsColor = BASIC_BTN_COLOR;
    }
  }

  private setCurrentColor(sectionNameToCurrent: string) {
    if (sectionNameToCurrent === DASHBOARD_SECTION) {
      this.dashboardColor = CURRENT_BTN_COLOR;
    } else if (sectionNameToCurrent === EDIT_TEAMS_SECCTION) {
      this.teamsColor = CURRENT_BTN_COLOR;
    } else if (sectionNameToCurrent === RETRO_PROCES_SECCTION) {
      this.retroProcessColor = CURRENT_BTN_COLOR;
    } else if (sectionNameToCurrent === All_RETROBOARDS_LIST_SECTION) {
      this.allRetroBoardListColor = CURRENT_BTN_COLOR;
    } else if (sectionNameToCurrent === ALL_NOTIFICATIONS_SECTION) {
      this.allNotificationsColor = CURRENT_BTN_COLOR;
    }
  }

  private setCurrentSectionByRoute() {
    if (this.currentRouteSecction.search(EDIT_TEAMS_SECCTION) > 0) {
      this.setBtnColor(EDIT_TEAMS_SECCTION);
      return;
    } else if (this.currentRouteSecction.search('process') > 0) {
      this.setBtnColor(RETRO_PROCES_SECCTION);
    } else if (this.currentRouteSecction.search('all-retroboard-list') > 0) {
      this.setBtnColor(All_RETROBOARDS_LIST_SECTION);
    } else if (this.currentRouteSecction.search('all-your-notification') > 0) {
      this.setBtnColor(ALL_NOTIFICATIONS_SECTION);
    } else {
      this.setBtnColor(DASHBOARD_SECTION);
    }
  }

  private subscribeEvents() {
    this.setNewTeamsSubscription = this.eventService.getSetTeamsAsDefaultSectionEmiter()
      .subscribe(() => this.setBtnColor(EDIT_TEAMS_SECCTION));
    this.setRetroProcessSubscription = this.eventService.getSetRetroProcessAsDefaultSectionEmiter()
      .subscribe(() => this.setBtnColor(RETRO_PROCES_SECCTION));
    this.goOutFromAllRetroBoardSubscription = this.eventService.getSetReciveGoOutFromAllRetroBoardListEmiter()
      .subscribe(() => this.setBtnColor(DASHBOARD_SECTION));
    this.setMoreHigherForBackgroundSubscription = this.eventService.getSetAllRetroBoardBackgroudnMoreHigherEmiter()
      .subscribe(() => this.shouldShowMoreHigherOnAllRetroBoardList = true);
    this.setNoMoreHigherForBackgroundSubscription = this.eventService.getSetAllRetroBoardBackgroudnNoMoreHigherEmiter()
      .subscribe(() => {
        if (this.shouldShowMoreHigherOnAllRetroBoardList) {
          this.shouldShowMoreHigherOnAllRetroBoardList = false;
        }
      });
    this.setAllRetroBoardsListSubscription = this.eventService.getSetAllRetroBoardAsDefaultSectionEmiter()
      .subscribe(() => this.setBtnColor(All_RETROBOARDS_LIST_SECTION));
    this.setAllNotificationSectionSubscription = this.eventService.getSetAllNotificationViewAsDefaultSectionEmiter()
      .subscribe(() => this.setBtnColor(ALL_NOTIFICATIONS_SECTION));
    this.shouldRefreshUserSettingsSubscription = this.eventService.getRefreshAfterUserSettingsWasChangedEmiter()
      .subscribe(() => this.getUserSettings());
  }
}
