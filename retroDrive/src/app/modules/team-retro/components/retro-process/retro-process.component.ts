import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { AddNewRetroBoardBottomsheetComponent } from '../add-new-retro-board-bottomsheet/add-new-retro-board-bottomsheet.component';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { RetroBoardToSave } from 'src/app/models/retroBoardToSave';
import { Teams } from 'src/app/models/teams';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RetroBoardSnackbarComponent } from '../retro-board-snackbar/retro-board-snackbar.component';
import { DataPassingService } from 'src/app/services/data-passing.service';
import { Router } from '@angular/router';
import { Team } from 'src/app/models/team';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { Workspace } from 'src/app/models/workspace';
import { User } from 'src/app/models/user';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { RetroBoard } from 'src/app/models/retroBoard';
import { AuthService } from 'src/app/services/auth.service';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { RetroBoardStatus } from 'src/app/models/retroBoardStatus';
import { EventsService } from 'src/app/services/events.service';
import { UsersInTeams } from 'src/app/models/usersInTeams';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';

@Component({
  selector: 'app-retro-process',
  templateUrl: './retro-process.component.html',
  styleUrls: ['./retro-process.component.css']
})
export class RetroProcessComponent implements OnInit, OnDestroy {

  retroBoards: RetroBoard[];
  retroBoardSubscriptions: any;

  dataIsLoading = true;

  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;
  currentUser: User;

  userJoinedToAnyTeam = false;
  teamsSubscriptions: any;
  userTeams: Team[];

  constructor(
    private bottomSheetRef: MatBottomSheet,
    private frbs: FirestoreRetroBoardService,
    private dataPassingService: DataPassingService,
    private snackBar: MatSnackBar,
    private router: Router,
    private localStorageService: LocalStorageService,
    private authService: AuthService,
    private eventServices: EventsService,
    private currentUserApiService: CurrentUserApiService) { }

  ngOnDestroy(): void {
    if (this.retroBoardSubscriptions !== undefined) {
      this.retroBoardSubscriptions.unsubscribe();
    }
  }

  ngOnInit() {
    this.currentUser = this.localStorageService.getDecryptedItem(this.localStorageService.currentUserKey);

    if (this.currentUser === undefined) {
      this.authService.signOut();
    } else {
      if (!this.currentUser.isNewUser) {
        this.userWorkspace = this.localStorageService.getDecryptedItem(this.localStorageService.userWorkspaceKey);
        this.currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent).workspace;
      } else {
        this.router.navigate(['/']);
      }
    }

    this.checkIfUserIsJoinedToAnyTeam();
    this.prepareRetroBoardForCurrentUser();
  }

  openBottomSheet(): void {
    const bottomSheetRef = this.bottomSheetRef.open(AddNewRetroBoardBottomsheetComponent);

    bottomSheetRef.afterDismissed().subscribe(() => { });
  }

  shouldShowRetroBoardElements() {
    if (this.retroBoards !== undefined) {
      if (this.retroBoards.length > 0) {
        return true;
      }
    }
    return false;
  }

  deleteRetroBoard(retroBoard: RetroBoard) {
    this.frbs.deleteRetroBoard(retroBoard);
    this.openSnackBarForDelete(retroBoard.retroName);
  }

  openSnackBarForDelete(retroBoardName) {
    const durationInSeconds = 5;
    this.snackBar.openFromComponent(RetroBoardSnackbarComponent, {
      duration: durationInSeconds * 1000,
      data: {
        shouldShowWarningMessage: true,
        displayText: 'Deleted Retro Board: ' + retroBoardName
      }
    });
  }

  onStartRetroProcess(retroBoard: RetroBoard) {
    const retroBoardLastRetroBoard: RetroBoardStatus = this.prepareRetroBoardStatus(retroBoard);

    if (this.currentUserApiService.isTokenExpired()) {
      this.currentUserApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserApiService.setRegeneratedToken(refreshedTokenResponse);
        this.setLastRetroBoardAsStarted(retroBoardLastRetroBoard, retroBoard);
      });
    } else {
      this.setLastRetroBoardAsStarted(retroBoardLastRetroBoard, retroBoard);
    }
  }

  goToTeams() {
    this.eventServices.emitSetTeamsAsDefaultSection();
    this.router.navigate(['/retro/teams']);
  }

  private checkIfUserIsJoinedToAnyTeam() {
    this.frbs.findUserTeams(this.currentUser.uid)
      .then(userInTeamSnapshot => {
        if (userInTeamSnapshot.empty) {
          this.userJoinedToAnyTeam = false;
        } else {
          if (userInTeamSnapshot.docs[0].data().teams.length > 0) {
            const userTeams = userInTeamSnapshot.docs[0].data() as UserTeamsToSave;
            userTeams.teams.forEach(teamRef => {
              teamRef.get().then(teamDoc => {
                const findedUserTeam = teamDoc.data();
                findedUserTeam.id = teamDoc.id as string;
                findedUserTeam.workspace.get().then(workspaceSnapshot => {
                  const userTeamToAdd = findedUserTeam as Team;
                  const findedWorkspaceFromUserTeam = workspaceSnapshot.data() as Workspace;
                  findedWorkspaceFromUserTeam.id = workspaceSnapshot.id;
                  userTeamToAdd.workspace = findedWorkspaceFromUserTeam;

                  if (findedWorkspaceFromUserTeam.id === this.currentWorkspace.id) {
                    this.userJoinedToAnyTeam = true;

                    return;
                  } else {
                    this.userJoinedToAnyTeam = false;

                  }
                });
              });
            });

          } else {
            this.userJoinedToAnyTeam = false;

          }
        }
      });
  }

  private prepareRetroBoardStatus(retroBoard: RetroBoard): RetroBoardStatus {
    return {
      retroBoardFirebaseDocId: retroBoard.id,
      teamFirebaseDocId: retroBoard.team.id,
      workspaceFirebaseDocId: retroBoard.workspaceId,
      isFinished: false,
      isStarted: true
    };
  }

  private setLastRetroBoardAsStarted(retroBoardLastRetroBoard: RetroBoardStatus, retroBoard: RetroBoard) {
    this.currentUserApiService
      .setLastRetroBoardAsStarted(
        retroBoardLastRetroBoard.retroBoardFirebaseDocId,
        retroBoardLastRetroBoard.teamFirebaseDocId,
        retroBoardLastRetroBoard.workspaceFirebaseDocId)
      .then(() => {
        this.updateInFirebase(retroBoard);
        this.processingToNewPage(retroBoard);
      })
      .catch(error => {
        const err = error;
      });
  }

  private processingToNewPage(retroBoard: RetroBoard) {
    this.dataPassingService.setData(retroBoard.urlParamId, retroBoard);
    this.router.navigateByUrl('/retro-in-progress/' + retroBoard.urlParamId);
  }

  private updateInFirebase(retroBoard: RetroBoard) {
    const retroBoardToUpdate = {
      isStarted: true
    };
    this.frbs.updateRetroBoard(retroBoardToUpdate, retroBoard.id);
  }

  private prepareRetroBoardForCurrentUser() {
    this.frbs.findUserTeams(this.currentUser.uid)
    .then(userTeamsSnapshot => {
      if (!userTeamsSnapshot.empty) {
        this.userTeams = new Array<Team>();
        const userTeams = userTeamsSnapshot.docs[0].data() as UserTeamsToSave;
        this.retroBoardSubscriptions = this.frbs.retroBoardFilteredByWorkspaceIdSnapshotChanges(this.currentWorkspace.id)
          .subscribe(snapshot => {
            this.dataIsLoading = snapshot.length > 0;
            this.retroBoards = [];
            this.CreateBaseRetroBoardData(snapshot, userTeams);
          });
      } else {
        this.dataIsLoading = false;
      }
    });
  }

  private CreateBaseRetroBoardData(snapshot: any, userTeams: UserTeamsToSave) {
    snapshot.forEach(retroBoardSnapshot => {
      const retroBoard = retroBoardSnapshot.payload.doc.data() as RetroBoard;

      if (retroBoard.isStarted) {
        this.dataIsLoading = false;
      }
      if (!retroBoard.isStarted) {
        retroBoard.id = retroBoardSnapshot.payload.doc.id;
        const team = retroBoardSnapshot.payload.doc.data().team.get();

        this.prepareRetroBoardWithTeams(team, retroBoard, userTeams);
      }
    });
  }

  private prepareRetroBoardWithTeams(team: any, retroBoard: RetroBoard, userTeams: UserTeamsToSave) {
    team.then(teamSnap => {
      const teamToAdd = teamSnap.data() as Team;
      teamToAdd.id = teamSnap.id as string;

      retroBoard.team = teamToAdd;

      if (userTeams.teams.some(ut => ut.id === retroBoard.team.id)) {
        this.addToRetroBoards(retroBoard);
      } else {
        this.dataIsLoading = false;
        if (this.retroBoards.length > 0) {
          this.userJoinedToAnyTeam = false;
        }
      }
    });
  }

  private addToRetroBoards(retroBoard: RetroBoard) {
    this.retroBoards.push(retroBoard);
    this.userJoinedToAnyTeam = true;
    this.dataIsLoading = false;
  }
}
