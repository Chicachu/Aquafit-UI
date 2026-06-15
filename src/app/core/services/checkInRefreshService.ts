import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckInRefreshService {
  private readonly _refresh = new Subject<string>();

  readonly refresh$ = this._refresh.asObservable();

  notifyEntriesChanged(employeeNumber: string): void {
    this._refresh.next(employeeNumber);
  }
}
