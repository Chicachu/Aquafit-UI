import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Location } from '@angular/common';
import { Router } from "@angular/router";

export enum ButtonType {
  EDIT = 'edit', 
  ADD = 'add',
  NONE = 'none'
}

@Component({
  selector: 'app-breadcrumb-nav-bar',
  templateUrl: './breadcrumb-nav-bar.component.html',
  styleUrls: ['./breadcrumb-nav-bar.component.scss']
})
export class BreadcrumbNavBarComponent {
  @Input() title: string = ''
  @Input() buttonType: ButtonType | null = null
  @Input() showBack = true
  @Input() backRoute: string[] | null = null
  @Output() onButtonClick: EventEmitter<void> = new EventEmitter()
  ButtonType = ButtonType

  constructor(
    private location: Location,
    private router: Router
  ) {
  }

  navigateBack(): void {
    if (!this.showBack) {
      return;
    }

    if (this.backRoute?.length) {
      this.router.navigate(this.backRoute);
      return;
    }

    this.location.back()
  }

  emitButtonClick(): void {
    this.onButtonClick.emit()
  }
}