import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-team-retro-process-in-progress',
  templateUrl: './team-retro-process-in-progress.component.html',
  styleUrls: ['./team-retro-process-in-progress.component.css']
})
export class TeamRetroProcessInProgressComponent implements OnInit {

  data: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    if (this.route.snapshot.data['retroBoardData']) {
      this.data = this.route.snapshot.data['retroBoardData'];
      console.log(this.data);
    }
  }
}
