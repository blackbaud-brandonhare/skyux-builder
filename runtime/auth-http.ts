import { Injectable } from '@angular/core';

import {
  Headers,
  Http,
  Request,
  RequestOptions,
  RequestOptionsArgs,
  Response,
  URLSearchParams
} from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { BBAuth } from '@blackbaud/auth-client';

@Injectable()
export class SkyAuthHttp extends Http {
  public request(
    url: string | Request,
    options?: RequestOptionsArgs
  ): Observable<Response> {
    return Observable.fromPromise(BBAuth.getToken())
      .flatMap((token: string) => {
        let authOptions: Request | RequestOptionsArgs;

        if (url instanceof Request) {
          // If the user calls get(), post(), or any of the other convenience
          // methods supplied by the Http base class, Angular will have converted
          // the url parameter to a Request object and the options parameter will
          // be undefined.
          authOptions = url;
          url.url = this.addEnvId(url.url);
        } else {
          // The url parameter can be a string in cases where request() is called
          // directly by the consumer.  Handle that case by adding the header to the
          // options parameter.
          authOptions = options || new RequestOptions();
          url = this.addEnvId(url);
        }

        authOptions.headers = authOptions.headers || new Headers();

        authOptions.headers.set('Authorization', 'Bearer ' + token);

        return super.request(url, authOptions);
      });
  }

  private addEnvId (url) {
    const urlSearchParams = new URLSearchParams(window.location.search.substr(1));
    const envid = urlSearchParams.get('envid');

    if (envid) {
      const delimeter = url.indexOf('?') === -1 ? '?' : '&';
      url = `${url}${delimeter}envid=${envid}`;
    }

    return url;
  }
}
