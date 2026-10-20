import { Store, select } from '@ngrx/store';
import { VersionCheckerService } from './core/services/version-checker.service';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { EchoesState } from '@store/reducers';
import { getSidebarCollapsed, getAppTheme } from '@store/app-core';
import { AppApi } from '@core/api/app.api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@env/environment';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  sidebarCollapsed$ = this.store.pipe(select(getSidebarCollapsed));
  theme$ = this.store.select(getAppTheme);

  @HostBinding('class') style = 'arctic';

  constructor(
    private store: Store<EchoesState>,
    private appApi: AppApi,
    private versionCheckerService: VersionCheckerService
  ) {
    this.versionCheckerService.start();
    const isLocalHost =
      window &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1');
    if (environment.production || !isLocalHost) {
      this.appApi.checkUserAuth();
    }
  }

  ngOnInit() {
    this.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => (this.style = theme));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
