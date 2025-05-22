import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() parent: any | null = null 
  @Input() title: string = ''
  @Input() buttonList: {text: string }[] = []
  @Output() modalClick = new EventEmitter<{ ref: any, buttonTitle: string }>()

  constructor() {}

  processButtonClick(buttonTitle: string): void {
    if (!this.parent) return 
    this.modalClick.emit({ ref: this.parent, buttonTitle })
  }
}