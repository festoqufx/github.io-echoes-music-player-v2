import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppApi } from '../api/app.api';

const HandledErrors = ['HttpErrorResponse'];
const DimissedErrors = ['popup_closed_by_user'];
const isYoutubeApiError = error =>
  error?.error?.error?.errors;
const isString = message => typeof message === 'string';

@Injectable({
  providedIn: 'root'
})
export class AppErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse | any) {
    const appApi = this.injector.get(AppApi);
    if (error && !DimissedErrors.includes(error.name) && !DimissedErrors.includes(error.reason)) {
      const sanitizedError = isYoutubeApiError(error)
        ? error.error.error.errors[0]
        : error;
      console.error('There was an ERROR:', error);
      const msg = sanitizedError?.message || error?.message || (typeof error === 'string' ? error : null);
      if (msg && msg !== 'undefined' && msg !== 'null') {
        const errorPayload = { message: msg };
        appApi.notifyError(errorPayload);
      }
    }
  }
}
