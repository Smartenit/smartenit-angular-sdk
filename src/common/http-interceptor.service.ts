import { Http, Request, RequestOptions, RequestOptionsArgs, Response, XHRBackend, Headers } from "@angular/http"
import { Injectable } from "@angular/core"
import { Observable } from 'rxjs/Observable';
import { Subject } from "rxjs/Subject";
import { EventsManagerService } from "../common/events-manager.service";
import { AppConfigurationService } from "../common/app-configuration.service";

import "rxjs/add/observable/throw"
import "rxjs/add/observable/empty";
import "rxjs/add/operator/catch"
import "rxjs/add/operator/map"
import "rxjs/add/operator/mergeMap"
import "rxjs/add/operator/timeout";

@Injectable()
export class HttpInterceptor extends Http {
  private _enqueueRequests: boolean = false;

  private static _enqueueRequests: boolean = false;
  public static get enqueueRequests(): boolean {
    return HttpInterceptor._enqueueRequests;
  }

  private notifier: Subject<any> = new Subject<any>();

  constructor(
    backend: XHRBackend,
    options: RequestOptions,
    public http: Http,
    public eventsManagerService: EventsManagerService,
    public AppConfiguration: AppConfigurationService
  ) {
    super(backend, options);

    this.eventsManagerService.onTokenRefreshStart.subscribe(() => {
      HttpInterceptor._enqueueRequests = true;
    })

    this.eventsManagerService.onServerConnectivityError.subscribe(() => {
      HttpInterceptor._enqueueRequests = true;
    })

    this.eventsManagerService.onConnectivityRecovered.subscribe(() => {
      HttpInterceptor._enqueueRequests = false;

      this.drainQueue();
    })

    this.eventsManagerService.onTokenRefreshed.subscribe(({ status, newAccessToken }) => {
      HttpInterceptor._enqueueRequests = false;

      if (status) {
        this.drainQueue(newAccessToken);
      }
    });

    this.eventsManagerService.onTokenRefreshError.subscribe(() => {
      HttpInterceptor._enqueueRequests = false;
    });

    this.eventsManagerService.onRestoreNetworkStatus.subscribe(() => {
      HttpInterceptor._enqueueRequests = false;
    });
  }

  private drainQueue(newAccessToken?: string) {
    this.notifier.next({ newAccessToken: newAccessToken, newAPIUrl: this.AppConfiguration.currentAPIURL });
  }

  private changeAccessTokenForRequest(headers: Headers, newAccessToken?: string): Headers {
    if (newAccessToken) {
      headers.set('authorization', newAccessToken);
    }

    return headers;
  }

  private changeAPIUrlForRequest(url: string, newAPIUrl: string): string {
    return url.replace(/.*smartenit\.io\/v2/, newAPIUrl);
  }

  private getNextRequest(newAccessToken: string, newAPIUrl: string, prevRequest: Request, options?: RequestOptionsArgs) {
    let adjustedUrl = new Request({
      method: prevRequest.method,
      url: this.changeAPIUrlForRequest(prevRequest.url, newAPIUrl),
      headers: this.changeAccessTokenForRequest(prevRequest.headers, newAccessToken),
      body: prevRequest.getBody(),
      responseType: prevRequest.responseType
    });
    return super.request(adjustedUrl, options);
  }

  public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    let localUrl: string;

    if (typeof url == 'string') {
      localUrl = url;
    } else {
      localUrl = (url as Request).url;
    }

    let urlToRequest: any;

    if (url instanceof Request) {
      urlToRequest = url;
    } else if (typeof url == 'string') {
      urlToRequest = new Request({ url: url });
    }

    if (HttpInterceptor._enqueueRequests && localUrl.indexOf('oauth2/token') < 0) {
      return this.notifier.asObservable()
        .flatMap(({ newAccessToken, newAPIUrl }) => {
          let adjustedUrl = new Request({
            method: urlToRequest.method,
            url: this.changeAPIUrlForRequest(urlToRequest.url, newAPIUrl),
            search: urlToRequest.search,
            headers: this.changeAccessTokenForRequest(urlToRequest.headers, newAccessToken),
            body: urlToRequest.body,
            responseType: urlToRequest.responseType
          });

          return super.request(adjustedUrl, options);
        });
    }

    let self = this;

    if (localUrl.indexOf('build/') < 0) {
      return super.request(url, options)
        .timeout(11 * 1000)
        .map(response => {
          if (localUrl.indexOf('oauth2/token') >= 0) {
            const jsonResponse = response.json();

            if (jsonResponse && jsonResponse.access_token) {
              HttpInterceptor._enqueueRequests = false;
              this.notifier.next({ newAccessToken: 'Bearer ' + jsonResponse.access_token, newAPIUrl: this.AppConfiguration.currentAPIURL });
            }
          }

          return response;
        })
        .catch((error: Response | any) => {
          console.log('intercepted error: ', error, url);
          if (error.name == 'TimeoutError' || error.status == 0 || error.status == 403 || error.status == 401) {
            self.eventsManagerService.trigger(EventsManagerService.ON_SERVER_CONNECTIVITY_ERROR, { error, enqueueRequests: HttpInterceptor.enqueueRequests });

            HttpInterceptor._enqueueRequests = true;

            if (localUrl.indexOf('oauth2/token') >= 0) {
              this.AppConfiguration.restoreInitialConfiguration();
              return Observable.throw(error);
            } else if (localUrl.indexOf('devices/reference') >= 0) {
              return Observable.throw(error);
            } else {
              return this.notifier.asObservable()
                .flatMap(({ newAccessToken, newAPIUrl }) => {
                  let adjustedUrl = new Request({
                    method: urlToRequest.method,
                    url: this.changeAPIUrlForRequest(urlToRequest.url, newAPIUrl),
                    search: urlToRequest.search,
                    headers: this.changeAccessTokenForRequest(urlToRequest.headers, newAccessToken),
                    body: urlToRequest.body,
                    responseType: urlToRequest.responseType
                  });

                  return super.request(adjustedUrl, options);
                });
            }
          }

          return Observable.throw(error);
        });
    } else {
      return Observable.empty();
    }
  }
}