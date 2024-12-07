import { Component, Input, PipeTransform } from "@angular/core";
import { BaseFormControlComponent } from "../base-form-control/base-form-control.component";
import { SelectOption } from "../../../../core/types/selectOption";
import { Pipes } from "../../../../core/types/enums/pipes";

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['../base-form-control/base-form-control.component.scss']
})
export class DropdownComponent extends BaseFormControlComponent {
  @Input() options!: SelectOption[]
  @Input() i18nPrefix!: string
}