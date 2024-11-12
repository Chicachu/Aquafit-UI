import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {
  newItemButtonText: string = ''
  listInfo: Map<string, string[]> = new Map()

  constructor(private route: ActivatedRoute) {
    this.newItemButtonText = this.route.snapshot.data['newItemButtonText']
    this.listInfo = this.route.snapshot.data['listInfo']
  }
}