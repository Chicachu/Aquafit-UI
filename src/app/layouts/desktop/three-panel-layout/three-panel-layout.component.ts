import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-three-panel-layout',
  templateUrl: './three-panel-layout.component.html',
  styleUrls: ['./three-panel-layout.component.scss']
})
export class ThreePanelLayoutComponent {
  @Input() panel1Width = '320px';
  @Input() panel3Width = '380px';
  /** When true, panel 2 hosts a router-outlet (must not be projected via ng-content). */
  @Input() panel2RouterOutlet = false;
  @Input() panel3RouterOutlet = false;
}
