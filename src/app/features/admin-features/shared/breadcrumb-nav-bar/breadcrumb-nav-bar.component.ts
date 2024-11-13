import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Location } from '@angular/common';

export enum ButtonType {
  EDIT = 'edit', 
  ADD = 'add'
}

@Component({
  selector: 'app-breadcrumb-nav-bar',
  templateUrl: './breadcrumb-nav-bar.component.html',
  styleUrls: ['./breadcrumb-nav-bar.component.scss']
})
export class BreadcrumbNavBarComponent {
  @Input() title: string = ''
  @Input() buttonType: ButtonType | null = null
  @Output() onButtonClick: EventEmitter<void> = new EventEmitter()
  ButtonType = ButtonType

  constructor(private location: Location) {
    console.log(this.buttonType)
  }

  navigateBack(): void {
    this.location.back()
  }

  emitButtonClick(): void {
    this.onButtonClick.emit()
  }
}