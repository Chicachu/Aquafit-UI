import { Component, Input } from '@angular/core';
import { Class } from '@/core/types/classes/class';

@Component({
  selector: 'app-class-slot',
  templateUrl: './class-slot.component.html',
  styleUrls: ['./class-slot.component.scss']
})
export class ClassSlotComponent {
  @Input() class: Class | null = null
}