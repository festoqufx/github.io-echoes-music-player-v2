import { Subscription, of, timer } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { environment } from '@env/environment';

import { AppApi } from '@api/app.api';
import { catchError, filter, retry, switchMap, take } from 'rxjs/operators';

interface INpmPackageJson {
  version: string;
  [param: string]: any;
}

function verifyPackage(packageJson: INpmPackageJson) {
  return !!(packageJson && packageJson.hasOwnProperty('version'));
}

@Injectable()
export class VersionCheckerService {
  private interval = 1000 * 60 * 60;
  private protocol = 'https';
  private prefix = 'raw.githubusercontent.com';
  private repo = 'festoqufx/festoqufx.github.io-echoes-music-player';
  private repoBranch = 'gh-pages';
  private pathToFile = 'assets/package.json';
  public url = `${this.protocol}://${this.prefix}/${this.repo}/${
    this.repoBranch
  }/${this.pathToFile}`;
  private requestHeaders = new HttpHeaders({
    'x-echoes-silent-error': 'true'
  });

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private appApi: AppApi
  ) {}

  check() {
    if (!environment.production) {
      return of(null);
    }
    return this.http.get(this.url, {
      headers: this.requestHeaders
    });
  }

  start() {
    if (!environment.production) {
      return null;
    }
    let checkTimer: Subscription;
    this.zone.runOutsideAngular(() => {
      checkTimer = timer(0, this.interval)
        .pipe(
          switchMap(() =>
            this.check().pipe(
              retry(2),
              catchError(() => of(null))
            )
          ),
          filter(verifyPackage)
        )
        .subscribe(response => this.appApi.recievedNewVersion(response));
    });
    return checkTimer;
  }

  updateVersion() {
    if (window) {
      window.location.reload(true);
    }
  }

  checkForVersion() {
    if (!environment.production) {
      return of(null).subscribe();
    }
    return this.check()
      .pipe(
        retry(2),
        catchError(() => of(null)),
        filter(verifyPackage),
        take(1)
      )
      .subscribe(response => this.appApi.notifyNewVersion(response));
  }
}
