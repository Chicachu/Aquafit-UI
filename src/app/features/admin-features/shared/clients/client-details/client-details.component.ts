import { Component } from "@angular/core";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent {
  ButtonType = ButtonType
  clientId: string | null = null

  constructor() {

  }

  ngOnInit(): void {
    // get client by id from server, edit button should be disabled until client is populated
  }
}