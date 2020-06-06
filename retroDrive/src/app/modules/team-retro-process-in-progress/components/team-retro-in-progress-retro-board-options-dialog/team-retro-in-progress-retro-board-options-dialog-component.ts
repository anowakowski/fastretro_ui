import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CurrentUsersInRetroBoard } from 'src/app/models/currentUsersInRetroBoard';
import { CurrentUserInRetroBoardDataToDisplay } from 'src/app/models/CurrentUserInRetroBoardDataToDisplay';
import { RetroBoard } from 'src/app/models/retroBoard';
import { RetroBoardOptions } from 'src/app/models/retroBoardOptions';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';

@Component({
  selector: 'app-team-retro-in-progress-retro-board-options-dialog-component',
  templateUrl: './team-retro-in-progress-retro-board-options-dialog-component.html',
  styleUrls: ['./team-retro-in-progress-retro-board-options-dialog-component.css']
})

export class TeamRetroInProgressRetroBoardOptionsDialogComponent implements OnInit {

  public dataIsLoading = true;
  retroBoardOptions: RetroBoardOptions;

  shouldBlurRetroBoardCard: boolean;
  hideVoutCountInretroBoardCard: boolean;
  selectedVouteCount = 6;

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressRetroBoardOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private currentUserApiService: CurrentUserApiService) { }

  ngOnInit() {
    if (this.currentUserApiService.isTokenExpired()) { 
      this.currentUserApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserApiService.setRegeneratedToken(refreshedTokenResponse);
        this.getRetroBoardOptions();
      });
    } else {
      this.getRetroBoardOptions();
    }
  }

  onChangeShouldBlurRetroBoardCard(event) {
    this.shouldBlurRetroBoardCard = event.checked;
  }

  onChangeHideVouteCountRetroBoardCard(event) {
    this.hideVoutCountInretroBoardCard = event.checked;
  }

  onChangeSlider(eventValue) {
    this.selectedVouteCount = eventValue as number;
  }

  saveNewChangesOfRetroBoardOptions() {
    const retroBoardOptionsToSave: RetroBoardOptions = {
      maxVouteCount: this.selectedVouteCount,
      shouldBlurRetroBoardCardText: this.shouldBlurRetroBoardCard,
      retroBoardFirebaseDocId: this.retroBoardOptions.retroBoardFirebaseDocId,
      shouldHideVoutCountInRetroBoardCard: this.hideVoutCountInretroBoardCard
    };

    this.currentUserApiService.SetRetroBoardOptions(retroBoardOptionsToSave).then(() => {
      this.dialogRef.close({freshRetroBoardOptions: retroBoardOptionsToSave});
    })
    .catch(error => {
      const err = error;
    });
  }

  closeClick(): void {
    this.dialogRef.close();
  }

  private getRetroBoardOptions() {
    this.currentUserApiService.getRetroBoardOptions(this.data.retroBoard.id).then(response => {
      this.retroBoardOptions = response;
      this.shouldBlurRetroBoardCard = this.retroBoardOptions.shouldBlurRetroBoardCardText;
      this.hideVoutCountInretroBoardCard = this.retroBoardOptions.shouldHideVoutCountInRetroBoardCard;
    })
    .catch(error => {
      const err = error;
      this.retroBoardOptions = this.data.retroBoardOptions as RetroBoardOptions;
    });
  }
}
