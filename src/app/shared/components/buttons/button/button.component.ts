import { Component, Input, Output, EventEmitter } from "@angular/core"

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() loading = false
  @Input() label!: string
  @Input() loadingMessage?: string
  @Output() onClick = new EventEmitter<void>()

  constructor() {}

  onButtonClick(): void {
    this.onClick.emit()
  }
}